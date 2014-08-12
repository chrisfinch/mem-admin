$(function () {

  var $priorityEvents = $("#eventsPriority");

  $("#eventsBin > li").draggable({
    axis: "y",
    connectToSortable: "#eventsPriority",
    helper: "clone"
  }).on("dragstart", function () {
    $priorityEvents.addClass("droppable");
  }).on("dragstop", function () {
    $priorityEvents.removeClass("droppable");
  });

  $priorityEvents.sortable({
    axis: "y"
  });

  $priorityEvents.on("sortupdate", function (event, ui) {
    console.log("update");
    crunchJsonAndSend();
  }).on("sortreceive", function (event, ui) {
    console.log("recieve", ui);
    $priorityEvents.removeClass("droppable");
    if ($priorityEvents.find(".event").length < 5) {
      ui.item.remove();
      bindCancel($priorityEvents);
    } else {
      var newId = ui.item.data("id");
      $priorityEvents.find("[data-id="+newId+"]").remove();
      alert("Only four priority events can be selected, please remove an old event if you wish to add a new one.");
    }
  });

  parseDates();

  bindCancel($priorityEvents);

});

var crunchJsonAndSend = function () {
  var $listItems = $("#eventsPriority > li");
  var order = [];

  $listItems.each(function (i, e) {
    order.push($(e).data("id"));
  });

  $.post("/order", { order: order }, function () {
    console.log("sent json");
    $( ".selector" ).draggable({ disabled: false });
  });
};

var bindCancel = function ($priorityEvents) {
  $priorityEvents.find(".event .remove").off("click").on("click", function (event) { // DIRTY!
    var $eventItem = $(event.target).parents(".event");
    $eventItem.clone()
      .prependTo("#eventsBin")
      .draggable({
        axis: "y",
        connectToSortable: "#eventsPriority",
        helper: "clone"
      }).on("dragstart", function () {
        $priorityEvents.addClass("droppable");
      }).on("dragstop", function () {
        $priorityEvents.removeClass("droppable");
      });
    $eventItem.remove();
    crunchJsonAndSend();
  });
};

var parseDates = function () {
  $(".event .date").each(function (i, e) {
    $(e).append("<span>" + new Date($(e).data("date")).toLocaleString("en-GB") + "</span>")
  });
};
