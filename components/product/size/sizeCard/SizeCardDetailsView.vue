<script>
import Vue from 'vue';
import BooleanTag from '@/components/BooleanTag';
import UsingColorValueBadge from '@/components/product/size/sizeCard/UsingColorValueBadge';
import Money from '@/components/Money';

import { FigCountry } from '@notoursllc/figleaf';

export default Vue.extend({
    name: 'SizeCardDetailsView',

    components: {
        BooleanTag,
        UsingColorValueBadge,
        Money,
        FigCountry
    },

    props: {
        size: {
            type: Object,
            default: () => {
                return {};
            }
        }
    }
});
</script>


<template>
    <div>

        <!-- inventory -->
        <div class="size-details-row">
            <label>{{ $t('Inventory') }}:</label>
            <div class="size-details-cell">{{ size.inventory_count }}</div>
        </div>

        <!-- Track inventory -->
        <div class="size-details-row">
            <label>{{ $t('Track inventory') }}:</label>
            <div class="size-details-cell">
                <boolean-tag
                    :value="size.track_inventory_count"
                    size="sm"
                    pill />
            </div>
        </div>

        <!-- Hide when out of stock -->
        <div class="size-details-row">
            <label>{{ $t('Hide when out of stock') }}:</label>
            <div class="size-details-cell">
                <boolean-tag
                    :value="size.visible_if_no_inventory"
                    size="sm"
                    pill />
            </div>
        </div>

        <!-- SKU -->
        <div class="size-details-row">
            <label>{{ $t('SKU') }}:</label>
            <div class="size-details-cell">{{ size.sku }}</div>
        </div>

        <!-- Barcode -->
        <div class="size-details-row">
            <label>{{ $t('Barcode') }}:</label>
            <div class="size-details-cell">{{ size.barcode }}</div>
        </div>

        <!-- Price -->
        <div class="size-details-row">
            <label>{{ $t('Price') }}:</label>
            <div class="size-details-cell">
                <using-color-value-badge v-if="size.base_price_inherit" />
                <money
                    v-else
                    :cents="size.base_price" />
            </div>
        </div>

        <!-- Compare at -->
        <div class="size-details-row">
            <label>{{ $t('Compare at') }}:</label>
            <div class="size-details-cell">
                <using-color-value-badge v-if="size.compare_at_price_inherit" />
                <money
                    v-else
                    :cents="size.compare_at_price" />
            </div>
        </div>

        <!-- Cost -->
        <div class="size-details-row">
            <label>{{ $t('Cost') }}:</label>
            <div class="size-details-cell">
                <using-color-value-badge v-if="size.cost_price_inherit" />
                <money
                    v-else
                    :cents="size.cost_price" />
            </div>
        </div>

        <!-- Weight -->
        <div class="size-details-row">
            <label>{{ $t('Weight (oz)') }}:</label>
            <div class="size-details-cell">
                <using-color-value-badge v-if="size.weight_oz_inherit" />
                <div v-else>{{ size.weight_oz }}</div>
            </div>
        </div>

        <!-- Country of origin -->
        <div class="size-details-row">
            <label>{{ $t('Country of origin') }}:</label>
            <div class="size-details-cell">
                <using-color-value-badge v-if="size.customs_country_of_origin_inherit" />
                <fig-country
                    v-else
                    :alpha2="size.customs_country_of_origin" />
            </div>
        </div>
    </div>
</template>


<style lang="postcss">
.size-details-row {
    @apply table-row;
}
.size-details-cell {
    @apply table-cell pb-1;
}
.size-details-row > label {
    @apply font-medium pr-2 pb-1;
}
</style>


