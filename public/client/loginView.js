Shortly.LoginView = Backbone.View.extend({


  template: Templates['login'],

  render: function() {
    this.$el.html(this.template());
    return this;
  }
});
