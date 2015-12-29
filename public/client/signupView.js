Shortly.SignupView = Backbone.View.extend({


  template: Templates['signup'],

  render: function() {
    console.log('inside the render signup');
    this.$el.html(this.template());
    return this;
  }
});


