<script lang="ts">
  import { FileCode2, GithubIcon } from "lucide-svelte";

  let { file } = $props();
</script>

<div class="flex gap-1">
  <div class="flex flex-1 items-center text-slate-500">
    <FileCode2 class="h-4 w-4" />
  </div>
  <a
    href={`https://github.com/mateothegreat/svelte5-router/blob/main/demo/${file}`}
    class="flex cursor-pointer items-center gap-1 text-center text-sm text-orange-400 hover:font-medium hover:text-indigo-400">
    {file}
  </a>
  <a
    href={`https://github.com/mateothegreat/svelte5-router/blob/main/demo/${file}`}
    target="_blank"
    class="flex cursor-pointer items-center gap-1 text-center text-sm text-slate-500 hover:font-medium hover:text-indigo-400">
    view source
    <GithubIcon class="h-4 w-4" />
  </a>
</div>
