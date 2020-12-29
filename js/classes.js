// Nav system
function CVNav(dom_id) {
    this.dom_jq = $(dom_id);
    
    this.build_item_list();
    
    
    //this.selected = 0;
    
}

CVNav.prototype.build_item_list = function() {
    this.CVNavItems = [];
    var $this = this;
    this.dom_jq.find("li").each(function( index ) {
        //console.debug(this);
        $this.CVNavItems.push( new CVNavItem(this, $this, index) );
    });
    this.CVNavItems[0].select();
};

CVNav.prototype.do_nav = function(index) {
    this.CVNavItems[0].unselect();
    this.do_scroll(index);
    //this.selected = index;
    //this.CVNavItems[0].select();
};

CVNav.prototype.do_scroll = function(to) {
    
    scroll_duration = 250.0;
    //console.debug(to);
    
    orig_height = this.dom_jq.children("ul").height();
    selected_title = this.CVNavItems[to].dom_jq.text();
    //console.debug(selected_title.toLowerCase().split(" ").join("_"));
    old_nav_items = [];
    new_nav_items = [];
    
    for ( i = 0; i < to; i++ ) {
        old_nav_item_jq = this.CVNavItems[i].dom_jq;
        new_nav_item_jq = old_nav_item_jq.clone();
        new_nav_item_jq.addClass("invisible");
        this.dom_jq.children("ul").append(new_nav_item_jq);
        //this.CVNavItems.push( new CVNavItem(new_nav_item_jq, this, i) );
        old_nav_items.push(old_nav_item_jq);
        new_nav_items.push(new_nav_item_jq);
    }
    
    new_height = this.dom_jq.children("ul").height();
    
    move_distance = Math.abs(new_height - orig_height);
    
    var $this = this;
    
    for ( index in old_nav_items ) {
        old_nav_items[index].fadeOut(
            {   duration: scroll_duration * 0.75,
                complete: function() {
                    $(this).addClass("invisible");
                    $(this).show();
                }
            }
        );
    }
    
    for ( index in new_nav_items ) {
        new_nav_items[index].removeClass("invisible");
        new_nav_items[index].hide();
        new_nav_items[index].fadeIn(
            {   duration: scroll_duration * 0.75,
                complete: function() {
                    //$(this).addClass("invisible");
                    //$(this).show();
                }
            }
        );
    }
    
    this.dom_jq.children("ul").animate(
        {"top":"-="+move_distance},
        {   duration:scroll_duration,
            complete: function() {
                for ( index in old_nav_items ) {
                    old_nav_items[index].remove();
                }
                //console.debug($this);
                $this.build_item_list();
                //for ( index in $this.CVNavItems ) {
                //    $this.CVNavItems[index].index = index;
                    //`console.debug(index);
                //}
                showContent(selected_title.toLowerCase().split(" ").join("_"));
                
                //showContent();
                
            },
            always: function() {
                //$this.dom_jq.children("ul").css({"padding-top":orig_padding});
                //scalePage();
            }
        }
    );
    
    
    
    //console.debug(this.dom_jq.children("ul").height());
    
    //console.debug(this.CVNavItems);
};

// Nav item
function CVNavItem(dom_id, parent_obj, index) {
    //console.debug(jQuery._data($(dom_id).get(0), "events"));
    this.dom_jq = $(dom_id);
    this.dom_jq.off("mouseenter");
    this.dom_jq.off("mouseleave");
    this.dom_jq.off("click");
    this.$CVNav = parent_obj;
    this.index = index;
    this.dom_jq.mouseenter({$this:this}, this.hover);
    this.dom_jq.mouseleave({$this:this}, this.unhover);
    this.dom_jq.click({$this:this}, this.do_nav);
}

CVNavItem.prototype.hover = function(event) {
    $this = event.data.$this;
    
    //console.debug($this.dom_jq.hasClass("selected"));
    
    if ( !$this.dom_jq.hasClass("selected") ) {
        $(event.delegateTarget).css("cursor","pointer");
        $(event.delegateTarget).addClass("hovered");
    }
};

CVNavItem.prototype.unhover = function(event) {
    $this = event.data.$this;
    
    if ( !$this.dom_jq.hasClass("selected") ) {
        $(event.delegateTarget).css("cursor","auto");
        $(event.delegateTarget).removeClass("hovered");
    }
};

CVNavItem.prototype.do_nav = function(event) {
    $this = event.data.$this;
    if ( !$this.dom_jq.hasClass("selected") ) {
        $(event.delegateTarget).css("cursor","auto");
        $(event.delegateTarget).removeClass("hovered");
        $this.$CVNav.do_nav($this.index);
    }
    //$(event.delegateTarget).css("cursor","auto");
    //$(event.delegateTarget).removeClass("hovered");
};

CVNavItem.prototype.select = function() {
    this.dom_jq.addClass("selected");
};

CVNavItem.prototype.unselect = function() {
    this.dom_jq.removeClass("selected");
};
