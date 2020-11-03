<script>
import isObject from 'lodash.isobject';
import cloneDeep from 'lodash.clonedeep';
import AccentMessageSelect from '@/components/product/accentMessage/AccentMessageSelect';
import DateInput from '@/components/DateInput';
import { isUuid4 } from '@/utils/common';

export default {
    name: 'AccentMessageWizard',

    components: {
        AccentMessageSelect,
        DateInput
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
                { text: this.$t('None'), value: null },
                { text: this.$t('Use pre-defined'), value: 'pre' },
                { text: this.$t('Create new'), value: 'create' }
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
                    this.accent_message_id = newVal.accent_message_id;
                    this.accent_message_begin = newVal.accent_message_begin;
                    this.accent_message_end = newVal.accent_message_end;

                    let selectedOptionIndex = 0;

                    if(this.accent_message_id) {
                        selectedOptionIndex = isUuid4(this.accent_message_id) ? 1 : 2;
                    }

                    this.action = this.actionSelectOptions[selectedOptionIndex].value;
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
                this.allAccentMessages = await this.$api.productSkuAccentMessages.all({
                    sortBy: 'message',
                    sortDesc: false
                });
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
                this.$errorToast(e.message);
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
            <app-message>
                <template v-slot:icon>
                    <fig-icon
                        icon="alert-circle"
                        variant="danger"
                        :width="24"
                        :height="24" />
                </template>
                {{ $t('This item is using a pre-defined Accent Message that no longer exists.') }}
            </app-message>
        </div>

        <b-form-select
            v-model="action"
            :options="visibleActionSelectOptions"
            class="widthAuto"
            @input="onActionSelectChange" />

        <fig-icon
            icon="arrow-right"
            v-if="action === 'pre' || action === 'create'" />

        <!-- select predefined accent message  -->
        <b-form-group
            v-show="canShowPredefinedMessages && action === 'pre'"
            :label="$t('Choose')"
            label-for="input_choose_message"
            class="inlineBlock mb-0 align-bottom">
            <accent-message-select
                v-model="accent_message_id"
                @input="emitInput"
                class="width150"
                id="input_choose_message" />
        </b-form-group>

        <!-- new message input -->
        <b-form-group
            v-show="action === 'create'"
            :label="$t('New message')"
            label-for="input_create_message"
            class="inlineBlock mb-0 align-bottom">
            <b-form-input
                v-if="action === 'create'"
                v-model="accent_message_new"
                @input="emitInput"
                class="widthAuto"
                id="input_create_message" />
        </b-form-group>

        <!-- date inputs -->
        <div class="pt-4" v-if="action">
            <b-row>
                <!--  accent message begin -->
                <b-col sm="12" lg="6">
                    <b-form-group
                        :label="$t('Display: Start')"
                        label-for="accent_message_begin"
                        :description="$t('sku_accent_message_begin_desc')">
                        <date-input
                            v-model="accent_message_begin"
                            @input="emitInput"
                            id="accent_message_begin" />
                    </b-form-group>
                </b-col>

                <!--  accent message end -->
                <b-col sm="12" lg="6">
                    <b-form-group
                        :label="$t('Display: End')"
                        label-for="accent_message_end"
                        :description="$t('sku_accent_message_end_desc')">
                        <date-input
                            v-model="accent_message_end"
                            @input="emitInput"
                            id="accent_message_end" />
                    </b-form-group>
                </b-col>
            </b-row>
        </div>

    </div>
</template>
