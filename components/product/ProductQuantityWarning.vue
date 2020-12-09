<script>
export default {
    name: 'ProductQuantityWarning',

    props: {
        max: {
            type: Number,
            default: 1
        }
    }
}
</script>


<template>
    <div v-if="max > 0 && max <= 10"
        class="inline-block text-yellow-600">{{ $t('only_num_left', { qty: max }) }}</div>
</template>
