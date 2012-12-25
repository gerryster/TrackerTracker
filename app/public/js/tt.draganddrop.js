TT.DragAndDrop = (function () {

  var pub = {};
  var dragOutFn, dragInFn, columnOut, columnIn;

  pub.getDragFn = function (element, type) {
    var fn;
    element = $(element).closest('.column');

    $.each(TT.Columns, function (index, column) {
      if (element.hasClass(column.class_name)) {
        if (type === 'in' && column.onDragIn) {
          fn = column.onDragIn;
        } else if (type === 'out' && column.onDragOut) {
          fn = column.onDragOut;
        }
      }
    });

    return fn;
  };

  pub.onStart = function (event, ui) {
    columnOut = $(ui.item).closest('.column')[0];
    dragOutFn = pub.getDragFn(ui.item, 'out');
  };

  pub.onBeforeStop = function (event, ui) {
    columnIn = $(ui.item).closest('.column')[0];
    if (columnOut === columnIn) {
      return true;
    }

    var story = TT.Stories[$(ui.item).data('story-id')];
    var data = {};

    dragInFn = pub.getDragFn(ui.item, 'in');

    if (dragOutFn) {
      $.extend(data, dragOutFn(story));
    }
    if (dragInFn) {
      $.extend(data, dragInFn(story));
    }

    if (dragOutFn || dragInFn) {
      $.extend(TT.Stories[story.id], data);
      setTimeout(TT.View.drawStories, 100);

      if (data.labels) {
        data.labels = data.labels.join(',');
      }

      $.post('/updateStory', { project_id: story.project_id, story_id: story.id, data: data });
    }

    dragOutFn = dragInFn = null;
  };

  pub.init = function () {
    $('.sortable-column').sortable({
      cancel: '.expanded-story',
      connectWith: '.sortable-column',
      containment: '#content',
      distance: 10,
      tolerance: 'pointer',
      start: pub.onStart,
      beforeStop: pub.onBeforeStop
    });

    $('#columns').sortable({
      containment: '#content',
      distance: 10,
      handle: '.column-title',
      tolerance: 'pointer',
      start: function (event, ui) {
        ui.placeholder.width(ui.helper.width() - 4);
      }
    });
  };

  return pub;

}());