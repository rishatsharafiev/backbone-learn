var app = {};

// класс модели данных
app.Todo = Backbone.Model.extend({
    // поля по умолчанию при создании экземпляра
    defaults: {
        title: '',
        completed: false
    },

    // валидация полей
    validate: function(attrs) {
        if(attrs.title.length > 25) {
            return "запись должна быть не более 25 символов";
        }
    }
});

// класс коллекции данных, созданных по классу модели
app.TodoList = Backbone.Collection.extend({
    // класс модели
    model: app.Todo,

    // хранилище данных
    localStorage: new Store("backbone-todo")

});

// класс отрисовки одной записи
app.TodoView = Backbone.View.extend({
    // элемент в котром будет новая запись
    tagName: 'li',

    // html шаблон
    template: _.template($('#item-template').html()),

    // отрисовка
    render: function(){
        this.$el.html(this.template(this.model.toJSON()));
        this.input = this.$('.edit');
        return this;
    },

    initialize: function(){
        this.model.on('change', this.render, this);
        this.model.on('destroy', this.remove, this);
    },

    events: {
        'dblclick label' : 'edit',
        'keypress .edit' : 'updateOnEnter',
        'blur .edit' : 'close',
        'click .toggle': 'toggleCompleted',
        'click .destroy': 'destroy'
    },

    edit: function(){
        this.$el.addClass('editing');
        this.input.focus();
    },

    close: function(){
        var value = this.input.val().trim();
        if(value) {
            this.model.save({title: value});
        }
        this.$el.removeClass('editing');
    },

    updateOnEnter: function(e){
        if(e.which == 13){
            this.close();
        }
    },

    destroy: function(){
        this.model.destroy();
    }

});

// экземпляр коллекции
app.todoList = new app.TodoList();

// класс отрисовки всех записей
app.AppView = Backbone.View.extend({

    // элемент в который помещают все записи
    el: '#todoapp',

    // инициализатор перед загрузкой
    initialize: function () {
        this.input = this.$('#new-todo'); // пое ввода
        app.todoList.on('add', this.addOne, this); // обработчик события добавления в коллекцию записи
        app.todoList.on('reset', this.addAll, this); // обработчик события обновления страницы
        app.todoList.on("invalid", function(model, error) {  // обработчик события невалидной модели
            alert(error);
        });
        app.todoList.fetch(); // подтянуть данные по умолчанию из хранилища
    },

    events: {
        'keypress #new-todo': 'createTodoOnEnter' // обработчик события нажатия клавиши
    },

    createTodoOnEnter: function(e){
        if ( e.which !== 13 || !this.input.val().trim() ) { // отследить enter
            return;
        }
        app.todoList.create(this.newAttributes(), { validate: true }); // создать запись в коллекции
        this.input.val(''); // отчистить поле ввода
    },

    addOne: function(todo){
        var view = new app.TodoView({model: todo}); // создать элемент под одну запись
        $('#todo-list').append(view.render().el); // добавить элемент в конец
    },

    addAll: function(){
        this.$('#todo-list').html(''); // отчистить список напоминалок
        app.todoList.each(this.addOne, this); // записать все напоминания
    },

    newAttributes: function(){
        return {
          title: this.input.val().trim(),
          completed: false
        }
    }
});

app.appView = new app.AppView();