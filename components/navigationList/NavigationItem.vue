<script>
import uuid from 'uuid';
import { FigIconLabel } from '@notoursllc/figleaf';

const uniqueId = uuid();

export default {
    components: {
        FigIconLabel
    },

    props: {
        route: {
            type: Object,
            default: () => {
                return {
                    name: uniqueId
                };
            }
        }
    },

    inject: ['menuListState']
};
</script>


<template>
    <nuxt-link
        class="navigation-item"
        :to="route"
        tag="li"
        role="menuitem">
        <label>
            <fig-icon-label>
                <template v-slot:left v-if="$slots.icon"><slot name="icon" /></template>
                <slot></slot>
            </fig-icon-label>
        </label>
    </nuxt-link>
</template>
