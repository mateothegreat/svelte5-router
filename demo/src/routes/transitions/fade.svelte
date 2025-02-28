<script>
  import Badge from "$lib/components/badge.svelte";
  import Container from "$lib/components/container.svelte";
  import InlineCode from "$lib/components/inline-code.svelte";
  import { fade } from "svelte/transition";
</script>

<div in:fade={{ duration: 500 }}>
  <Container
    title="Fade"
    file="src/routes/transitions/fade.svelte">
    <div class="flex flex-col items-center gap-6 bg-sky-600 p-10 text-center">
      <Badge variant="info">This is a transition that is applied to the component directly</Badge>
      <div class="flex flex-col gap-3">
        This is a transition that is applied to the component directly:
        <InlineCode text={"<div in:fade={{ duration: 300 }}>..</div>"} />
      </div>
    </div>
  </Container>
</div>
