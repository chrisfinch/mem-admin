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
    crunchJsonAndSend();
  }).on("sortreceive", function (event, ui) {
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


  $(".new-image").popover({
    html: true,
    title: "Event image upload",
    content: function() {
      return $(".image-upload", $(this).parents(".event")).html();
    }
  }).on("shown.bs.popover", function (event) {
    this.$popover = $(event.target).siblings(".popover")
    this.$popover.find("form").on("submit", bindUploadForm.bind(this));
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

var bindUploadForm = function (event) {
  event.preventDefault();
  var self = this;
  var $form = $(event.target);
  var file = $form.find(".upload-input")[0].files[0];

  if (file) {

    checkFile(file, function (result) { // Check the aspect ratio of the file to make sure that it's a 5:3 image

      if (result) { // check that we should defiantely use this image

        $form.find('.spinner').css('display', 'inline-block');

        var name = $form.find(".upload-input").attr("name");
        var data = new FormData();
        data.append(name, file);

        // cache image base64 to check against
        var img = self.$popover.parents(".event").find("img")[0];
        $(img).parent().addClass("loading");

        $.ajax({
          type: "POST",
          url: "/upload",
          data: data,
          cache: false,
          contentType: false,
          processData : false
        }).done(function success () {
          $form.find('.spinner').hide(); // Hide spinner
          self.$popover.popover("hide"); // Hide popover

          //remove loading spinner
          setTimeout(function(){
            $(img).parent().removeClass("loading");
          }, 5000);

        }).fail(function fail () {
          alert("Upload failed, please retry.");
          self.$popover.popover("hide");
        });

      } else {
        self.$popover.popover("hide");
      }

    });

  } else {
    alert("Please choose a file to upload.");
  }

};

var checkFile = function (file, callback) { // check an images aspect ratio using the HTML5 file api
  var confirmMessage = [];
  confirmMessage.push("This image is not at the correct 5:3 Aspect Ratio (eg: 1920x1152).");
  confirmMessage.push("Uploading this image will probably break the layout on the membership pages or display in an unfavourable way.");
  confirmMessage.push("Please confirm you wish to upload this image (you have been warned!)");
  var reader = new FileReader();
  reader.onload = function(e) {
    try {
      var img = new Image();
      img.src = e.target.result;
      var w = img.naturalWidth, h = img.naturalHeight, fiveByThree = 1920/1152;

      if (w/h === fiveByThree) {
        callback(true);
      } else {
        if (confirm(confirmMessage.join("\n\r"))) {
          callback(true);
        } else {
          callback(false);
        }
      }

    } catch (e) {
      alert("The image file could not be read: " + e);
      callback(false);
    }

  };
  reader.readAsDataURL(file);
};
