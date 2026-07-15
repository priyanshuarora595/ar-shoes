'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { DeepAR, FootData } from 'deepar';

export type { FootData } from 'deepar';

interface DeepARTryOnProps {
  // null means "no effect authored for the current selection yet" — keeps
  // the camera/session alive rather than forcing a remount (see below).
  effectUrl: string | null;
  onFeetTracked?: (left: FootData, right: FootData) => void;
}

type Status = 'loading' | 'ready' | 'error';
type EffectStatus = 'idle' | 'loading' | 'ready' | 'error';

// DeepAR's SDK has global init state and rejects overlapping initialize()
// calls. React Strict Mode's dev-only mount/cleanup/remount cycle would
// otherwise fire a second initialize() while the first is still in flight,
// so every mount/cleanup pair is serialized through this module-level chain.
let deepARLifecycle: Promise<void> = Promise.resolve();

export default function DeepARTryOn({ effectUrl, onFeetTracked }: DeepARTryOnProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const deepARRef = useRef<DeepAR | null>(null);
  const effectChainRef = useRef<Promise<void>>(Promise.resolve());
  const [status, setStatus] = useState<Status>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [effectStatus, setEffectStatus] = useState<EffectStatus>('idle');
  const [effectErrorMessage, setEffectErrorMessage] = useState<string | null>(null);

  // Base SDK init: camera + license only, no effect. Runs once per mount so
  // switching effects (e.g. different product models) doesn't tear down the
  // camera/session.
  useEffect(() => {
    let cancelled = false;
    let instance: DeepAR | null = null;

    deepARLifecycle = deepARLifecycle.then(async () => {
      if (cancelled) return;

      setStatus('loading');
      setErrorMessage(null);

      const licenseKey = process.env.NEXT_PUBLIC_DEEPAR_LICENSE_KEY;
      if (!licenseKey) {
        setErrorMessage('Missing NEXT_PUBLIC_DEEPAR_LICENSE_KEY - add it to .env.local (see developer.deepar.ai)');
        setStatus('error');
        return;
      }
      if (!containerRef.current) return;

      try {
        console.log('[browser] DeepARTryOn: initialize() starting...');
        console.time('[browser] DeepARTryOn: initialize()');
        const deepar = await import('deepar');

        // DeepAR's SDK hardcodes a console.warn() any time rootPath differs
        // from its default CDN path — there's no SDK option to suppress it,
        // and we deliberately self-host (see rootPath below), so it fires on
        // every init. Filter out just this one known-expected message.
        const originalWarn = console.warn;
        console.warn = (...args: unknown[]) => {
          if (typeof args[0] === 'string' && args[0].includes('Using non-default root path')) {
            return;
          }
          originalWarn(...args);
        };

        let deepAR;
        try {
          deepAR = await deepar.initialize({
            licenseKey,
            previewElement: containerRef.current,
            // Self-hosted from public/deepar-sdk (copied from node_modules/deepar)
            // instead of DeepAR's default jsdelivr CDN — avoids multi-MB
            // WASM/model downloads over whatever connection the test device has.
            rootPath: '/deepar-sdk/',
            additionalOptions: {
              cameraConfig: { facingMode: 'environment' },
              // Docs/reference implementations confirm every footTrackingConfig
              // field is required for shoe-tryon effects — the implicit
              // rootPath-based lazy load (what we relied on before) silently
              // hangs instead of resolving. `hint: 'footInit'` forces eager
              // loading instead of waiting for switchEffect to trigger it.
              footTrackingConfig: {
                poseEstimationWasmPath: '/deepar-sdk/wasm/libxzimgPoseEstimation.wasm',
                detectorPath: '/deepar-sdk/models/foot/foot-detector-96x96x6-q8.bin',
                trackerPath: '/deepar-sdk/models/foot/foot-keyps-superfast-23JUN2024.bin',
                objPath: '/deepar-sdk/models/foot/foot-right-200.obj',
                tfjsBackendWasmPath: '/deepar-sdk/wasm/tfjs-backend-wasm.wasm',
                tfjsBackendWasmSimdPath: '/deepar-sdk/wasm/tfjs-backend-wasm-simd.wasm',
                tfjsBackendWasmThreadedSimdPath: '/deepar-sdk/wasm/tfjs-backend-wasm-threaded-simd.wasm',
              },
              hint: 'footInit',
            },
          });
        } finally {
          console.warn = originalWarn;
        }
        console.timeEnd('[browser] DeepARTryOn: initialize()');

        if (cancelled) {
          deepAR.shutdown();
          return;
        }

        instance = deepAR;
        deepARRef.current = deepAR;
        deepAR.callbacks.onFeetTracked = onFeetTracked;
        setStatus('ready');
      } catch (err: unknown) {
        console.error('[browser] DeepARTryOn: initialization failed:', err);
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to initialize DeepAR';
          setErrorMessage(message);
          setStatus('error');
        }
      }
    });

    return () => {
      cancelled = true;
      deepARLifecycle = deepARLifecycle.then(() => {
        if (instance) {
          instance.shutdown();
          deepARRef.current = null;
          instance = null;
        }
      });
    };
    // Base init only runs once per mount; effect/callback swaps are handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load/switch the AR effect once the base SDK is ready, separately timed
  // and reported so a slow/incompatible effect doesn't look like a stuck init.
  //
  // Chained through effectChainRef for the same reason initialize() is
  // chained through deepARLifecycle above: React Strict Mode's dev-only
  // mount/cleanup/remount cycle would otherwise fire switchEffect() twice
  // concurrently on the same instance. Unlike initialize(), switchEffect()
  // doesn't reject the second call with a clear error — it just hangs,
  // which is what was actually causing every "stuck loading" symptom.
  useEffect(() => {
    if (status !== 'ready' || !deepARRef.current) return;

    let cancelled = false;
    const deepAR = deepARRef.current;

    effectChainRef.current = effectChainRef.current.then(async () => {
      if (cancelled) return;

      if (!effectUrl) {
        deepAR.clearEffect();
        setEffectStatus('idle');
        setEffectErrorMessage(null);
        return;
      }

      setEffectStatus('loading');
      setEffectErrorMessage(null);
      const startedAt = Date.now();
      console.log(`[browser] DeepARTryOn: switchEffect(${effectUrl}) starting...`);

      // switchEffect() has no built-in timeout, so a hang inside effect/foot-
      // tracking init would otherwise spin the loading UI forever with no
      // signal. Log elapsed time periodically so a hang is visible/measurable.
      const progressInterval = setInterval(() => {
        console.log(`[browser] DeepARTryOn: switchEffect(${effectUrl}) still pending after ${Math.round((Date.now() - startedAt) / 1000)}s`);
      }, 5000);

      const timeout = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Timed out waiting for effect to load after 20s: ${effectUrl}`)), 20000);
      });

      try {
        await Promise.race([deepAR.switchEffect(effectUrl), timeout]);
        console.log(`[browser] DeepARTryOn: switchEffect(${effectUrl}) resolved after ${Date.now() - startedAt}ms`);
        if (!cancelled) setEffectStatus('ready');
      } catch (err: unknown) {
        console.error(`[browser] DeepARTryOn: switchEffect failed after ${Date.now() - startedAt}ms:`, err);
        if (!cancelled) {
          const message = err instanceof Error ? err.message : `Failed to load effect: ${effectUrl}`;
          setEffectErrorMessage(message);
          setEffectStatus('error');
        }
      } finally {
        clearInterval(progressInterval);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [effectUrl, status]);

  // Keep the tracking callback current without tearing down/re-initializing DeepAR.
  useEffect(() => {
    if (deepARRef.current) {
      deepARRef.current.callbacks.onFeetTracked = onFeetTracked;
    }
  }, [onFeetTracked]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <div ref={containerRef} className="h-full w-full" />

      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/80 text-sm text-zinc-300">
          Loading DeepAR...
        </div>
      )}

      {status === 'ready' && effectStatus === 'idle' && !effectUrl && (
        <div className="pointer-events-none absolute bottom-24 left-0 right-0 flex items-center justify-center px-6 text-center text-xs text-zinc-400">
          No AR effect authored for this selection yet.
        </div>
      )}

      {status === 'ready' && effectStatus === 'loading' && (
        <div className="pointer-events-none absolute bottom-24 left-0 right-0 flex items-center justify-center text-xs text-zinc-300">
          Loading shoe effect...
        </div>
      )}

      {status === 'ready' && effectStatus === 'error' && (
        <div className="pointer-events-none absolute bottom-24 left-0 right-0 flex items-center justify-center px-6 text-center text-xs text-red-400">
          {effectErrorMessage}
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/90 p-6 text-center text-sm text-red-400">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
