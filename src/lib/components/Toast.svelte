<script lang="ts">
	import { toast } from '$lib/stores/toast';
	import { fly, fade } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-svelte';

	const icons = {
		success: CheckCircle2,
		error: AlertCircle,
		info: Info,
		warning: AlertTriangle
	};

	const styles = {
		success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
		error: 'bg-red-50 text-red-800 border-red-200',
		info: 'bg-blue-50 text-blue-800 border-blue-200',
		warning: 'bg-amber-50 text-amber-800 border-amber-200'
	};

	const iconStyles = {
		success: 'text-emerald-500',
		error: 'text-red-500',
		info: 'text-blue-500',
		warning: 'text-amber-500'
	};
</script>

<div class="fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-2 pointer-events-none">
	{#each $toast as t (t.id)}
		<div
			animate:flip={{ duration: 300 }}
			in:fly={{ y: 20, duration: 300 }}
			out:fade={{ duration: 200 }}
			class="pointer-events-auto max-w-sm w-full bg-white shadow-lg rounded-xl border border-slate-100 overflow-hidden flex"
		>
			<div class="w-2 {t.type === 'success' ? 'bg-emerald-500' : t.type === 'error' ? 'bg-red-500' : t.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}"></div>
			<div class="p-4 flex items-start flex-1">
				<svelte:component
					this={icons[t.type]}
					class="w-5 h-5 mt-0.5 mr-3 shrink-0 {iconStyles[t.type]}"
				/>
				<div class="flex-1">
					<p class="text-sm font-medium text-slate-800 leading-tight">
						{t.message}
					</p>
				</div>
				<button
					class="ml-4 text-slate-400 hover:text-slate-600 transition-colors"
					onclick={() => toast.remove(t.id)}
				>
					<X class="w-4 h-4" />
				</button>
			</div>
		</div>
	{/each}
</div>
