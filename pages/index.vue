<script>
export default {
    middleware: [
        function({ redirect }) {
            redirect('/reports/orders/list');
        }
    ]
};
</script>
