<script>
import {
    FigLabelValueGroup,
    FigLabelValue,
    FigNuxtImgBunny
} from '@notoursllc/figleaf';

export default {
    components: {
        FigLabelValueGroup,
        FigLabelValue,
        FigNuxtImgBunny
    },

    props: {
        product: {
            type: Object,
            default() {
                return {};
            }
        }
    },

    methods: {
        getProductImage() {
            return (this.product.product_variant && Array.isArray(this.product.product_variant.images))
                ? this.product.product_variant.images[0].url
                : null;
        },

        getMasterTypeName(object, value) {
            if(Array.isArray(this.$store.state.masterTypes[object])) {
                for(let i=0; i<this.$store.state.masterTypes[object].length; i++) {
                    if(this.$store.state.masterTypes[object][i].value === value) {
                        return this.$store.state.masterTypes[object][i].name;
                    }
                }
            }
            return null;
        }
    }
};
</script>


<template>
    <div class="bg-white rounded p-2 sm:p-3 flex items-start shadow border border-gray-200">
        <div class="mr-2 sm:mr-4">
            <fig-nuxt-img-bunny
                v-if="getProductImage()"
                :src="getProductImage()"
                preset="prodthumb"
                loading="lazy"
                class="shadow" />
        </div>
        <div class="grow text-sm">
            <div class="flex flex-wrap -mx-2 overflow-hidden">
                <div class="my-2 px-2 w-full lg:w-1/2">
                    <fig-label-value-group density="md" display="table">
                        <fig-label-value>
                            <template v-slot:label>{{ $t('Title') }}:</template>
                            {{ product.title }}
                        </fig-label-value>

                        <template v-if="product.product_variant">
                            <fig-label-value>
                                <template v-slot:label>{{ $t('Color') }}:</template>
                                {{ getMasterTypeName('product_basic_color_type', product.product_variant.basic_color_type) }}
                            </fig-label-value>

                            <fig-label-value>
                                <template v-slot:label>{{ $t('Size') }}:</template>
                                {{ product.product_variant_sku.label }}
                            </fig-label-value>

                            <fig-label-value>
                                <template v-slot:label>{{ $t('SKU') }}:</template>
                                {{ product.product_variant_sku.sku }}
                            </fig-label-value>
                        </template>
                    </fig-label-value-group>
                </div>

                <div class="my-2 px-2 w-full lg:w-1/2">
                    <fig-label-value-group density="md" display="table">
                        <fig-label-value>
                            <template v-slot:label>{{ $t('Product type') }}:</template>
                            {{ getMasterTypeName('product_type', product.type) }}
                        </fig-label-value>

                        <fig-label-value>
                            <template v-slot:label>{{ $t('Product sub-type') }}:</template>
                            {{ getMasterTypeName('product_sub_type', product.sub_type) }}
                        </fig-label-value>

                        <fig-label-value>
                            <template v-slot:label>{{ $t('Gender') }}:</template>
                            {{ getMasterTypeName('product_gender_type', product.gender_type) }}
                        </fig-label-value>

                        <fig-label-value>
                            <template v-slot:label>{{ $t('Fit') }}:</template>
                            {{ getMasterTypeName('product_fit_type', product.fit_type) }}
                        </fig-label-value>

                        <fig-label-value>
                            <template v-slot:label>{{ $t('Sleeve') }}:</template>
                            {{ getMasterTypeName('product_sleeve_length_type', product.sleeve_length_type) }}
                        </fig-label-value>
                    </fig-label-value-group>
                </div>
            </div>
        </div>
    </div>
</template>


<style>
.product_attr_group > label {
    @apply block text-sm font-semibold;
}
</style>
