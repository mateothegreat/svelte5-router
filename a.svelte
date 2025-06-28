<!--
  NestedDialog.svelte
  A Svelte 5 implementation of nested dialogs using runes
-->
<script lang="ts">
	import { setContext, getContext } from 'svelte';

	// Context for dialog state management
	interface DialogContextValue {
		innerOpen: boolean;
		setInnerOpen: (value: boolean) => void;
	}

	const DIALOG_CONTEXT_KEY = Symbol('dialog-context');

	// Utility function to combine classes (cn equivalent)
	function cn(...classes: (string | undefined)[]): string {
		return classes.filter(Boolean).join(' ');
	}

	// Main dialog state
	let outerOpen = $state(false);
	let innerOpen = $state(false);
	let selectedPaymentMethod = $state('creditcard');

	// Context value for nested dialogs
	const contextValue: DialogContextValue = {
		get innerOpen() { return innerOpen; },
		setInnerOpen: (value: boolean) => { innerOpen = value; }
	};

	setContext(DIALOG_CONTEXT_KEY, contextValue);

	// Keyboard handling
	$effect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				if (innerOpen) {
					innerOpen = false;
					e.stopPropagation();
				} else if (outerOpen) {
					outerOpen = false;
				}
			}
		};

		if (outerOpen || innerOpen) {
			document.addEventListener('keydown', handleEscape);
			return () => document.removeEventListener('keydown', handleEscape);
		}
	});

	// Props for this component instance
	export let triggerText = 'Payment Dialog';
	export let class: string = '';

	// Default class sets
	const overlayClasses = "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm";
	const contentClasses = "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-white p-6 shadow-lg duration-200";
	const innerContentClasses = "fixed left-[50%] top-[50%] z-[60] grid w-full max-w-lg translate-x-[-50%] translate-y-[-45%] gap-4 rounded-lg border bg-white p-6 shadow-lg duration-200";
	const closeButtonClasses = "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none";
	const buttonVariants = {
		default: "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2",
		outline: "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
	};
	const inputClasses = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
</script>

<!-- Dialog Overlay -->
{#snippet DialogOverlay(onclick: () => void)}
	<div 
		class={overlayClasses}
		onclick={onclick}
		onkeydown={() => {}}
		role="presentation"
		tabindex="-1"
	></div>
{/snippet}

<!-- SVG Icons -->
{#snippet XIcon()}
	<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
		<line x1="18" y1="6" x2="6" y2="18"></line>
		<line x1="6" y1="6" x2="18" y2="18"></line>
	</svg>
{/snippet}

{#snippet CreditCardIcon()}
	<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
		<rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
		<line x1="1" y1="10" x2="23" y2="10"></line>
	</svg>
{/snippet}

{#snippet WalletIcon()}
	<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
		<rect x="1" y="3" width="15" height="13"></rect>
		<polygon points="16,8 20,8 23,11 23,16 16,16 16,8"></polygon>
		<circle cx="1.5" cy="6.5" r=".5"></circle>
	</svg>
{/snippet}

{#snippet AppleIcon()}
	<svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
		<path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
	</svg>
{/snippet}

<!-- Main Component -->
<div class={cn("p-4", class)}>
	<!-- Dialog Trigger -->
	<button 
		class={buttonVariants.default}
		onclick={() => outerOpen = true}
		type="button"
	>
		{triggerText}
	</button>

	<!-- Main Dialog -->
	{#if outerOpen}
		{@render DialogOverlay(() => outerOpen = false)}
		<div 
			class={cn(contentClasses, "p-0")}
			role="dialog"
			aria-modal="true"
			aria-labelledby="dialog-title"
		>
			<!-- Dialog Header -->
			<div class="border-b p-4">
				<h2 id="dialog-title" class="text-lg font-semibold leading-none tracking-tight">Payment</h2>
				<p class="text-sm text-muted-foreground mt-1.5">
					Please enter your credit card credentials below to complete the payment process.
				</p>
			</div>

			<!-- Payment Form Content -->
			<div class="flex flex-col gap-4 p-4">
				<div class="flex flex-col">
					<label for="cardholder" class="mb-1.5 text-xs text-muted-foreground">Card Holder*</label>
					<input 
						id="cardholder"
						class={inputClasses}
						placeholder="Card Holder Name" 
					/>
				</div>
				<div class="flex flex-col">
					<label for="cardnumber" class="mb-1.5 text-xs text-muted-foreground">Card Number*</label>
					<div class="relative">
						<input 
							id="cardnumber"
							class={cn(inputClasses, "ps-9")}
							placeholder="Card number" 
						/>
						<div class="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80">
							{@render CreditCardIcon()}
						</div>
					</div>
				</div>
				<div class="grid grid-cols-2 gap-2">
					<div class="flex flex-col">
						<label for="expiry" class="mb-1.5 text-xs text-muted-foreground">Expiration month and year*</label>
						<input 
							id="expiry"
							class={inputClasses}
							placeholder="MM/YY" 
						/>
					</div>
					<div class="flex flex-col">
						<label for="cvc" class="mb-1.5 text-xs text-muted-foreground">CVC*</label>
						<input 
							id="cvc"
							class={inputClasses}
							placeholder="CVC" 
						/>
					</div>
				</div>
			</div>

			<!-- Dialog Footer -->
			<div class="flex flex-col items-center justify-between space-y-2 border-t px-4 py-2 sm:flex-row sm:space-y-0">
				<!-- Inner Dialog Trigger -->
				<button 
					class={cn(buttonVariants.outline, "w-full sm:w-auto")}
					onclick={() => innerOpen = true}
					type="button"
				>
					Payment Method
				</button>

				<div class="flex w-full flex-col items-center gap-2 sm:w-auto sm:flex-row">
					<button 
						class={cn(buttonVariants.outline, "w-full sm:w-auto")}
						onclick={() => outerOpen = false}
						type="button"
					>
						Cancel
					</button>
					<button 
						class={cn(buttonVariants.default, "w-full sm:w-auto")}
						type="button"
					>
						Save
					</button>
				</div>
			</div>

			<!-- Close Button -->
			<button 
				class={closeButtonClasses}
				onclick={() => outerOpen = false}
				type="button"
				aria-label="Close dialog"
			>
				{@render XIcon()}
				<span class="sr-only">Close</span>
			</button>
		</div>
	{/if}

	<!-- Inner Dialog -->
	{#if innerOpen}
		<div 
			class={cn(
				innerContentClasses, 
				"p-0 sm:-mt-1",
				contextValue.innerOpen && "translate-y-[-55%] scale-[0.97]"
			)}
			role="dialog"
			aria-modal="true"
			aria-labelledby="inner-dialog-title"
		>
			<!-- Inner Dialog Header -->
			<div class="border-b p-4">
				<h2 id="inner-dialog-title" class="text-lg font-semibold leading-none tracking-tight">Choose a payment method</h2>
				<p class="text-sm text-muted-foreground mt-1.5">Select your preferred payment option</p>
			</div>

			<!-- Payment Method Options -->
			<div class="flex flex-col gap-4 p-4">
				<div class="space-y-3">
					<!-- Credit Card Option -->
					<div
						class={cn(
							"flex cursor-pointer items-center justify-between rounded-lg border p-4 hover:bg-accent",
							selectedPaymentMethod === "creditcard" && "bg-accent"
						)}
						onclick={() => selectedPaymentMethod = "creditcard"}
						onkeydown={(e) => e.key === 'Enter' && (selectedPaymentMethod = "creditcard")}
						role="button"
						tabindex="0"
					>
						<div class="flex items-center space-x-4">
							{@render WalletIcon()}
							<div>
								<h3 class="text-sm font-medium">Credit Card</h3>
								<p class="text-sm text-muted-foreground">
									Pay with Visa, Mastercard, or American Express
								</p>
							</div>
						</div>
						<div class={cn(
							"aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
							selectedPaymentMethod === "creditcard" && "bg-primary"
						)}>
							{#if selectedPaymentMethod === "creditcard"}
								<div class="flex items-center justify-center">
									<div class="h-2.5 w-2.5 rounded-full bg-white"></div>
								</div>
							{/if}
						</div>
					</div>

					<!-- PayPal Option -->
					<div
						class={cn(
							"flex cursor-pointer items-center justify-between rounded-lg border p-4 hover:bg-accent",
							selectedPaymentMethod === "paypal" && "bg-accent"
						)}
						onclick={() => selectedPaymentMethod = "paypal"}
						onkeydown={(e) => e.key === 'Enter' && (selectedPaymentMethod = "paypal")}
						role="button"
						tabindex="0"
					>
						<div class="flex items-center space-x-4">
							{@render CreditCardIcon()}
							<div>
								<h3 class="text-sm font-medium">PayPal</h3>
								<p class="text-sm text-muted-foreground">
									Pay with your PayPal account
								</p>
							</div>
						</div>
						<div class={cn(
							"aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
							selectedPaymentMethod === "paypal" && "bg-primary"
						)}>
							{#if selectedPaymentMethod === "paypal"}
								<div class="flex items-center justify-center">
									<div class="h-2.5 w-2.5 rounded-full bg-white"></div>
								</div>
							{/if}
						</div>
					</div>

					<!-- Apple Pay Option -->
					<div
						class={cn(
							"flex cursor-pointer items-center justify-between rounded-lg border p-4 hover:bg-accent",
							selectedPaymentMethod === "applepay" && "bg-accent"
						)}
						onclick={() => selectedPaymentMethod = "applepay"}
						onkeydown={(e) => e.key === 'Enter' && (selectedPaymentMethod = "applepay")}
						role="button"
						tabindex="0"
					>
						<div class="flex items-center space-x-4">
							{@render AppleIcon()}
							<div>
								<h3 class="text-sm font-medium">Apple Pay</h3>
								<p class="text-sm text-muted-foreground">
									Pay with Apple Pay
								</p>
							</div>
						</div>
						<div class={cn(
							"aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
							selectedPaymentMethod === "applepay" && "bg-primary"
						)}>
							{#if selectedPaymentMethod === "applepay"}
								<div class="flex items-center justify-center">
									<div class="h-2.5 w-2.5 rounded-full bg-white"></div>
								</div>
							{/if}
						</div>
					</div>
				</div>
			</div>

			<!-- Inner Dialog Footer -->
			<div class="flex flex-col items-center justify-between space-y-2 border-t px-4 py-2 sm:flex-row sm:space-x-2 sm:space-y-0">
				<button 
					class={cn(buttonVariants.outline, "w-full sm:w-auto")}
					onclick={() => outerOpen = false}
					type="button"
				>
					Cancel Payment Method
				</button>
				<button 
					class={cn(buttonVariants.default, "w-full sm:w-auto")}
					onclick={() => innerOpen = false}
					type="button"
				>
					Continue
				</button>
			</div>

			<!-- Inner Dialog Close Button -->
			<button 
				class={closeButtonClasses}
				onclick={() => innerOpen = false}
				type="button"
				aria-label="Close payment method dialog"
			>
				{@render XIcon()}
				<span class="sr-only">Close</span>
			</button>
		</div>
	{/if}
</div>
