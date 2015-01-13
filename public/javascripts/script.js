var eventOrdering = {
    init: function () {
        var $priorityEvents = $('#eventsPriority');

        if ($priorityEvents.length) {

            $('#eventsBin > li').draggable({
                axis: 'y',
                connectToSortable: '#eventsPriority',
                helper: 'clone'
            }).on('dragstart', function () {
                $priorityEvents.addClass('droppable');
            }).on('dragstop', function () {
                $priorityEvents.removeClass('droppable');
            });

            $priorityEvents.sortable({
                axis: 'y'
            });

            $priorityEvents.on('sortupdate', function (event, ui) {
                eventOrdering.crunchJsonAndSend();
            }).on('sortreceive', function (event, ui) {
                $priorityEvents.removeClass('droppable');

                if ($priorityEvents.find('.event').length < 5) {
                    ui.item.remove();
                    eventOrdering.bindCancel($priorityEvents);
                } else {
                    var newId = ui.item.data('id');
                    $priorityEvents.find('[data-id=' + newId + ']').remove();
                    alert('Only four priority events can be selected, please remove an old event if you wish to add a new one.');
                }
            });

            eventOrdering.parseDates();
            eventOrdering.bindCancel($priorityEvents);
        }
    },
    crunchJsonAndSend: function () {
        var $listItems = $('#eventsPriority > li');
        var order = [];

        $listItems.each(function (i, e) {
            order.push($(e).data('id'));
        });

        $.post('/order', {
            order: order
        }, function () {
            $('.selector').draggable({ disabled: false });
        });
    },
    bindCancel: function ($priorityEvents) {
        $priorityEvents.find('.event .remove').off('click').on('click', function (event) { // DIRTY!
            var $eventItem = $(event.target).parents('.event');
            $eventItem.clone()
                .prependTo('#eventsBin')
                .draggable({
                    axis: 'y',
                    connectToSortable: '#eventsPriority',
                    helper: 'clone'
                }).on('dragstart', function () {
                    $priorityEvents.addClass('droppable');
                }).on('dragstop', function () {
                    $priorityEvents.removeClass('droppable');
                });
            $eventItem.remove();
            eventOrdering.crunchJsonAndSend();
        });
    },
    parseDates: function () {
        $('.event .date').each(function (i, e) {
            $(e).append('<span>' + new Date($(e).data('date')).toLocaleString('en-GB') + '</span>')
        });
    }
};
