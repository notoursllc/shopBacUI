<script>
import isObject from 'lodash.isobject';
import cloneDeep from 'lodash.clonedeep';
import AccentMessageSelect from '@/components/product/accentMessage/AccentMessageSelect';
import { isUuid4 } from '@/utils/common';

import {
    FigFormInputDate,
    FigFormInput,
    FigFormGroup,
    FigFormSelect,
    FigIconLabel
} from '@notoursllc/figleaf';

export default {
    name: 'AccentMessageWizard',

    components: {
        AccentMessageSelect,
        FigFormInputDate,
        FigFormInput,
        FigFormGroup,
        FigFormSelect,
        FigIconLabel
    },

    inheritAttrs: false,

    props: {
        model: {
            type: Object,
            default: null
        }
    },

    data: function() {
        return {
            loading: false,
            actionSelectOptions: [
                { label: this.$t('None'), value: null },
                { label: this.$t('Use pre-defined'), value: 'pre' },
                { label: this.$t('Create new'), value: 'create' }
            ],
            accent_message_new: null,
            accent_message_id: null,
            accent_message_begin: null,
            accent_message_end: null,
            action: null,
            allAccentMessages: []
        };
    },

    computed: {
        canShowPredefinedMessages() {
            return this.allAccentMessages.length;
        },

        visibleActionSelectOptions() {
            const opts = cloneDeep(this.actionSelectOptions);

            if(!this.canShowPredefinedMessages) {
                opts.splice(1, 1);
            }

            return opts;
        },

        showWarning() {
            if(!this.accent_message_id) {
                return false;
            }

            let exists = false;

            this.allAccentMessages.forEach((opt) => {
                if(opt.id === this.accent_message_id) {
                    exists = true;
                }
            });

            return !exists;
        }
    },

    watch: {
        model: {
            handler(newVal) {
                if(isObject(newVal)) {
                    this.accent_message_id = newVal.accent_message_id || null;
                    this.accent_message_begin = newVal.accent_message_begin || null;
                    this.accent_message_end = newVal.accent_message_end || null;

                    if(this.accent_message_id) {
                        const selectedOptionIndex = isUuid4(this.accent_message_id) ? 1 : 2;
                        this.action = this.actionSelectOptions[selectedOptionIndex].value;
                    }
                }
                else {
                    this.action = this.actionSelectOptions[0].value;
                    this.accent_message_id = null;
                    this.accent_message_begin = null;
                    this.accent_message_end = null;
                }
            },
            immediate: true
        }
    },

    created() {
        this.fetchAllAccentMessages();
    },

    methods: {
        async fetchAllAccentMessages() {
            try {
                const { data } = await this.$api.product.accentMessage.list({
                    _sort: 'message:asc'
                });
                this.allAccentMessages = data;
                // const options = [];

                // if(Array.isArray(data)) {
                //     data.forEach((obj) => {
                //         options.push({
                //             label: obj.message,
                //             value: obj.id
                //         });
                //     });
                // }
            }
            catch(e) {
                this.$figleaf.errorToast({
                    title: this.$t('Error'),
                    text: e.message
                });
            }
        },

        emitInput() {
            // When the user clears form elements, the values are changed to empty strings.
            // Setting the value to null in this case, for consistency
            if(!this.accent_message_new) {
                this.accent_message_new = null;
            }
            if(!this.accent_message_begin) {
                this.accent_message_begin = null;
            }
            if(!this.accent_message_end) {
                this.accent_message_end = null;
            }

            this.$emit('input', {
                accent_message_id: this.action === this.actionSelectOptions[1].value ? this.accent_message_id : this.accent_message_new,
                accent_message_begin: this.accent_message_begin,
                accent_message_end: this.accent_message_end
            });
        },

        onActionSelectChange(val) {
            this.emitInput();
        }
    }
};
</script>


<template>
    <div>
        <div class="pb-3" v-if="showWarning">
            <fig-icon-label>
                <fig-icon
                    slot="left"
                    icon="alert-circle"
                    variant="danger"
                    :width="24"
                    :height="24" />
                {{ $t('This item is using a pre-defined Accent Message that no longer exists.') }}
            </fig-icon-label>
        </div>


        <div class="flex flex-row items-end mb-3 w-full">
            <div>
                <fig-form-select
                    class="min-w-max"
                    v-model="action"
                    :options="visibleActionSelectOptions"
                    :clearable="false"
                    @input="onActionSelectChange"
                    :reduce="obj => obj.value" />
            </div>

            <div class="px-1 pb-2">
                <fig-icon
                    icon="arrow-right"
                    v-if="action === 'pre' || action === 'create'" />
            </div>

            <div>
                <!-- select predefined accent message  -->
                <fig-form-group v-show="canShowPredefinedMessages && action === 'pre'">
                    <label slot="label" for="input_choose_message">{{ $t('Choose') }}</label>
                    <accent-message-select
                        v-model="accent_message_id"
                        :clearable="false"
                        @input="emitInput"
                        class="w-36"
                        id="input_choose_message" />
                </fig-form-group>

                <!-- new message input -->
                <fig-form-group
                    v-show="action === 'create'">
                    <label slot="label" for="input_create_message">{{ $t('New message') }}</label>
                    <fig-form-input
                        v-if="action === 'create'"
                        v-model="accent_message_new"
                        @input="emitInput"
                        class="w-auto"
                        id="input_create_message" />
                </fig-form-group>
            </div>
        </div>


        <!-- date inputs -->
        <div class="flex flex-wrap -mx-2 overflow-hidden" v-if="action">

            <!--  accent message begin -->
            <div class="my-2 px-2 w-full xl:w-1/2">
                <fig-form-group>
                    <label slot="label" for="accent_message_begin">{{ $t('Display: Start') }}</label>
                    <fig-form-input-date
                        v-model="accent_message_begin"
                        @input="emitInput"
                        id="accent_message_begin" />
                    <div slot="description">{{ $t('accent_message_begin_desc') }}</div>
                </fig-form-group>
            </div>

            <!--  accent message end -->
            <div class="my-2 px-2 w-full xl:w-1/2">
                <fig-form-group>
                    <label slot="label" for="accent_message_end">{{ $t('Display: End') }}</label>
                    <fig-form-input-date
                        v-model="accent_message_end"
                        @input="emitInput"
                        id="accent_message_end" />
                    <div slot="description">{{ $t('accent_message_end_desc') }}</div>
                </fig-form-group>
            </div>

        </div>

    </div>
</template>

