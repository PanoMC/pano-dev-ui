<script>
    export let variant = 'primary';
</script>

<button class="btn {variant}">
    <slot />
</button>

<style>
    .btn {
        padding: 8px 12px;
    }
</style>
