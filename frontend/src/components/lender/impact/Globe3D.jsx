import React, { useEffect, useRef, useState } from 'react';

export default function Globe3D() {
    const canvasRef = useRef();
    const containerRef = useRef();
    const [globeLoaded, setGlobeLoaded] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let globe;
        let phi = 0;

        const initGlobe = async () => {
            try {
                const cobe = await import('cobe');
                const createGlobe = cobe.default;

                if (!canvasRef.current) return;

                globe = createGlobe(canvasRef.current, {
                    devicePixelRatio: 2,
                    width: 600,
                    height: 600,
                    phi: 0,
                    theta: 0,
                    dark: 1,
                    diffuse: 1.2,
                    mapSamples: 16000,
                    mapBrightness: 6,
                    baseColor: [0.1, 0.1, 0.2],
                    markerColor: [0.1, 0.8, 1],
                    glowColor: [0.2, 0.2, 0.5],
                    markers: [
                        { location: [37.7595, -122.4367], size: 0.03 },
                        { location: [40.7128, -74.0060], size: 0.03 },
                        { location: [51.5074, -0.1278], size: 0.03 },
                        { location: [35.6895, 139.6917], size: 0.03 },
                        { location: [-33.8688, 151.2093], size: 0.03 },
                        { location: [-23.5505, -46.6333], size: 0.03 },
                        { location: [1.3521, 103.8198], size: 0.03 },
                    ],
                    onRender: (state) => {
                        state.phi = phi;
                        phi += 0.003;
                    },
                });
                setGlobeLoaded(true);
            } catch (err) {
                console.error('Globe init error:', err);
                setError(err.message);
            }
        };

        initGlobe();

        return () => {
            if (globe) globe.destroy();
        };
    }, []);

    return (
        <div ref={containerRef} className="w-full h-full relative flex items-center justify-center bg-[#0f172a]/60 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-50 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-transparent to-transparent" />

            <div className="absolute top-6 left-6 z-10">
                <h3 className="text-white font-semibold mb-1 shadow-black/50 drop-shadow-md">Live Impact Nodes</h3>
                <p className="text-xs text-gray-300">Real-time telemetry stream</p>
            </div>

            {error ? (
                <div className="text-center p-8">
                    <div className="text-6xl mb-4">🌍</div>
                    <p className="text-gray-400 text-sm">Interactive globe visualization</p>
                    <p className="text-gray-500 text-xs mt-2">Showing project locations worldwide</p>
                </div>
            ) : (
                <canvas
                    ref={canvasRef}
                    width={600}
                    height={600}
                    style={{
                        width: '100%',
                        maxWidth: '500px',
                        height: 'auto',
                        aspectRatio: '1'
                    }}
                    className="opacity-90 hover:opacity-100 transition-opacity duration-500 cursor-grab active:cursor-grabbing"
                />
            )}

            <div className="absolute bottom-6 right-6 flex items-center gap-2 z-10">
                <div className={`w-2 h-2 rounded-full ${globeLoaded ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
                <span className={`text-xs font-mono ${globeLoaded ? 'text-green-400' : 'text-yellow-400'}`}>
                    {globeLoaded ? 'ONLINE' : 'LOADING'}
                </span>
            </div>
        </div>
    );
}
