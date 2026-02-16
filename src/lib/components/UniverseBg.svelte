<script lang="ts">
	import { onMount } from 'svelte';
	import createGlobe from 'cobe';
	import { Spring } from 'svelte/motion';

	let canvas: HTMLCanvasElement;
	let globeCanvas: HTMLCanvasElement;
	let isDark = $state(false);

	const x = new Spring(0, {
		stiffness: 0.04,
		damping: 0.4,
		precision: 0.005
	});

	let pointerInteracting = $state<number | null>(null);
	let pointerInteractionMovement = 0;
	let phi = 0;
	let width = 0;

	onMount(() => {
		const ctx = canvas.getContext('2d')!;
		let w: number, h: number;
		let stars: { x: number; y: number; size: number; speed: number; t: number }[] = [];

		let globe: ReturnType<typeof createGlobe> | null = null;

		const onResize = () => {
			w = canvas.width = window.innerWidth;
			h = canvas.height = window.innerHeight;
			if (globeCanvas) width = globeCanvas.offsetWidth;
		};

		const initGlobe = () => {
			isDark = document.documentElement.classList.contains('dark');
			if (globe) globe.destroy();

			globe = createGlobe(globeCanvas, {
				devicePixelRatio: 2,
				width: width * 2,
				height: width * 2,
				phi: 0,
				theta: 0.3,
				dark: isDark ? 1 : 0,
				diffuse: isDark ? 0.4 : 1.2,
				mapSamples: 12000,
				mapBrightness: isDark ? 2.5 : 3,
				baseColor: isDark ? [0.6, 0.6, 0.6] : [1, 1, 1],
				markerColor: [59 / 255, 130 / 255, 246 / 255],
				glowColor: isDark ? [0.2, 0.2, 0.35] : [0.9, 0.9, 1],
				markers: [{ location: [-7.2575, 112.7521], size: 0.1 }],
				onRender: (state: Record<string, number>) => {
					if (!pointerInteracting) phi += 0.003;
					state.phi = phi + x.current;
					state.width = width * 2;
					state.height = width * 2;
				}
			});
		};

		const initStars = () => {
			stars = Array.from({ length: 80 }, () => ({
				x: Math.random() * window.innerWidth,
				y: Math.random() * window.innerHeight,
				size: Math.random() * 1.2 + 0.1,
				speed: Math.random() * 0.03 + 0.005,
				t: Math.random() * 100
			}));
		};

		const draw = () => {
			ctx.clearRect(0, 0, w, h);
			if (document.documentElement.classList.contains('dark')) {
				ctx.fillStyle = '#ffffff';
				for (let i = 0; i < stars.length; i++) {
					const s = stars[i];
					s.t += 0.005;
					const twinkle = (Math.sin(s.t) + 1) / 2;
					ctx.globalAlpha = 0.1 + twinkle * 0.3;
					ctx.beginPath();
					ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
					ctx.fill();
					s.y -= s.speed;
					if (s.y < 0) s.y = h;
				}
			}
			requestAnimationFrame(draw);
		};

		window.addEventListener('resize', onResize);
		onResize();
		initStars();
		initGlobe();
		draw();

		const observer = new MutationObserver(() => initGlobe());
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

		return () => {
			window.removeEventListener('resize', onResize);
			observer.disconnect();
			if (globe) globe.destroy();
		};
	});
</script>

<div
	class="fixed inset-0 -z-50 overflow-hidden bg-[#fafafa] transition-colors duration-1000 dark:bg-[#030303]"
>
	<div class="scene opacity-100 transition-opacity duration-1000 dark:opacity-0">
		<div class="ambient-clouds">
			<div class="cloud c1"></div>
			<div class="cloud c2"></div>
		</div>
	</div>

	<div class="scene absolute inset-0 opacity-0 transition-opacity duration-1000 dark:opacity-100">
		<div class="aurora-slim"></div>
		<div class="nebula-minimal"></div>
	</div>

	<div class="absolute inset-0 flex items-center justify-center">
		<div
			class="relative aspect-square w-full max-w-[600px] opacity-60 transition-opacity duration-1000 hover:opacity-100 dark:opacity-30 dark:hover:opacity-60"
		>
			<canvas
				bind:this={globeCanvas}
				class="h-full w-full cursor-grab active:cursor-grabbing"
				onpointerdown={(e) => (pointerInteracting = e.clientX - pointerInteractionMovement)}
				onpointerup={() => (pointerInteracting = null)}
				onpointerout={() => (pointerInteracting = null)}
				onmousemove={(e) => {
					if (pointerInteracting !== null) {
						const delta = e.clientX - pointerInteracting;
						pointerInteractionMovement = delta;
						x.target = delta / 200;
					}
				}}
			></canvas>
		</div>
	</div>

	<canvas
		bind:this={canvas}
		class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-1000 dark:opacity-100"
	></canvas>
</div>

<style>
	.scene {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	/* --- LIGHT MODE --- */
	.ambient-clouds .cloud {
		position: absolute;
		background: #f1f5f9;
		border-radius: 50%;
		filter: blur(90px);
		opacity: 0.3;
		animation: drift 60s ease-in-out infinite alternate;
	}
	.c1 {
		width: 50vw;
		height: 30vw;
		top: -10%;
		left: -5%;
	}
	.c2 {
		width: 40vw;
		height: 40vw;
		bottom: -15%;
		right: 5%;
		background: #f8fafc;
	}

	/* --- DARK MODE --- */
	.aurora-slim {
		position: absolute;
		top: 10%;
		left: -10%;
		width: 120%;
		height: 30vh;
		background: linear-gradient(
			to right,
			transparent,
			rgba(16, 185, 129, 0.1),
			rgba(59, 130, 246, 0.1),
			transparent
		);
		filter: blur(50px);
		animation: sway 30s ease-in-out infinite alternate;
	}
	.nebula-minimal {
		position: absolute;
		inset: 0;
		background: radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.03) 0%, transparent 50%);
		filter: blur(120px);
	}

	@keyframes drift {
		from {
			transform: translate(0, 0);
		}
		to {
			transform: translate(3%, 1.5%);
		}
	}
	@keyframes sway {
		from {
			transform: rotate(-4deg);
		}
		to {
			transform: rotate(-7deg);
		}
	}
</style>
