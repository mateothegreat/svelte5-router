<script lang="ts">
  import { route } from "@mateothegreat/svelte5-router";
  import { LockIcon, ShieldAlert } from "lucide-svelte";
</script>

<div class="flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
  <div class="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
    <div class="text-center">
      <div class="mb-4 flex justify-center">
        <ShieldAlert class="h-16 w-16 text-red-600" />
      </div>
      <h1 class="mb-2 text-3xl font-bold text-gray-900">Access Denied</h1>
      <div class="mb-4 flex items-center justify-center gap-2 text-red-600">
        <LockIcon class="h-5 w-5" />
        <span class="font-semibold">Secure Area</span>
      </div>
      <p class="mb-4 text-gray-600">For your security, access to this banking area has been denied. This may be due to:</p>
      <ul class="mb-6 ml-4 list-disc text-left text-gray-600">
        <li>Insufficient permissions</li>
        <li>Invalid authentication</li>
        <li>Session timeout</li>
      </ul>
      <p class="text-sm text-gray-500">Please contact our support team or return to the homepage if you believe this is an error.</p>
      <div class="mt-6">
        <a
          use:route
          href="/protected"
          class="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          Return to Homepage
        </a>
      </div>
    </div>
  </div>
</div>
