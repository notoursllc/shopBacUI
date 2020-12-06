<script>
import {
    FigButton,
    FigDropdown,
    FigDropdownButton
} from '@notoursllc/figleaf';

export default {
    name: 'OperationsDropdown',

    components: {
        FigButton,
        FigDropdown,
        FigDropdownButton
    },

    props: {
        showView: {
            type: Boolean,
            default: true
        },

        showEdit: {
            type: Boolean,
            default: true
        },

        showDelete: {
            type: Boolean,
            default: true
        }
    }
};
</script>

<template>
    <fig-dropdown placement="bottom">
        <span slot="toggler" slot-scope="props">
            <fig-button
                v-bind="props.ariaAttrs"
                variant="plain"
                size="sm"
                icon="chevron-down" />
        </span>

        <fig-dropdown-button v-if="showView" @click="$emit('view')">{{ $t('View') }}</fig-dropdown-button>
        <fig-dropdown-button v-if="showEdit" @click="$emit('edit')">{{ $t('Edit') }}</fig-dropdown-button>
        <fig-dropdown-button v-if="showDelete" @click="$emit('delete')">{{ $t('Delete') }}</fig-dropdown-button>
    </fig-dropdown>
</template>
