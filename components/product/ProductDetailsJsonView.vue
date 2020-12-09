<script>
export default {
    props: {
        product: {
            type: Object,
            required: true
        }
    }
}
</script>


<template>
    <div>
        <pre style="overflow-x:scroll">{{ product | formatJson }}</pre>

        <div class="mt-5">
            <div v-for="pic in product.pics" :key="pic.id" class="inline-block mr-5 align-top prodPic">
                <img :src="pic.url">
                <div>{{ pic.url }}</div>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
    .prodPic {
        width: 400px;
        overflow-wrap: break-word;
    }

    .tree-view-item-leaf {
        white-space: normal !important;
    }
</style>
