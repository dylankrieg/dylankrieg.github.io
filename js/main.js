// Load any external scripts that are needed.
(function() {
    $.getScript("js/classes.js", function() {
        page_nav = new CVNav("#column2");

    });

}());

// Page functions
function scalePage() {
    //adjust the font sizes
    total_width = $(window).outerWidth();
    //base_em = 3.125;
    base_em = 3.125;
    base_width = 1280.0;
    scale = base_em/base_width;
    golden_ratio = (1.0+Math.sqrt(5))/2.0;
    
    col1 = total_width * scale;
    col2 = total_width * scale * (1.0/golden_ratio);
    col3a = total_width * scale * (1.0/golden_ratio) * (1.0/golden_ratio);
    col3b = total_width * scale * (1.0/golden_ratio) * (1.0/golden_ratio) * (1.0/golden_ratio);
    
    //console.debug(golden_ratio);
    $("#column1 h1").css({"font-size":col1 + "em"});
    $("#column2 li").css({"font-size":col2 + "em"});
    $("#column3 h1").css({"font-size":col3a + "em"});
    $("#column3 p, #column3 li").css({"font-size":col3a + "em"});
    $("#column1 #links p").css({"font-size":col3a + "em"});
    
    //adjust the vertical margins and padding to line up all three columns
    total_height = $(window).outerHeight();
    
    $("#column1, #column2, #column3").css({"height":total_height + "px"});
    
    
    col1_line_height_split = $("#column1 h1").css("line-height").split("px");
    
    if ( col1_line_height_split.length > 1 ) {
        // the line height is already in pixels
        col1_line_height = parseFloat(col1_line_height_split[0]);
        col1_line_height_in_pix = true;
    } else {
        // the line height is a percentage of the font size
        col1_line_height = col1_line_height_split[0];
        col1_line_height_in_pix = false;
    }
    
    col1_font_size = parseFloat($("#column1 h1").css("font-size").split("px")[0]);
    
    links_height = $("#column1 #links").outerHeight(true);
    if (links_height == 0)
        links_height = $("#column1 #links p").outerHeight(true);
    col1_h1_height = $("#column1 h1").height();
    //console.debug(links_height);
    if (col1_line_height_in_pix)
        col1_baseline = col1_line_height - col1_font_size;
    else
        col1_baseline = (col1_line_height - 1) * col1_font_size;
    
    col2_li_bottom_margin = col1_baseline * 1.3;
    //console.log([$("#column1 h1").css("line-height"), col1_line_height,col1_font_size,col1_baseline]);
    $("#column2 li").css({"margin-bottom":col2_li_bottom_margin + "px"});
    
    top_position = total_height * (1.0 - 1.0/golden_ratio) - col1_baseline;
    
    //$("#column1 h1").css({"top":top_padding + "px", "position":"relative"});
    //$("#column2 ul").css({"top":(top_padding + col1_baseline) + "px", "position":"relative"});
    //$("#column3 .content").css({"top":(top_padding + col1_baseline) + "px", "position":"relative"});
    
    //console.debug([$("#column2 ul").outerHeight(true) + (top_position + col1_baseline) , total_height]);
    
    if ( $("#column2 ul").outerHeight(true) + top_position + col1_baseline > total_height ) {
        top_adjust = top_position - ($("#column2 ul").outerHeight(true) + top_position + col1_baseline - total_height);
        if (top_adjust < 0)
            top_adjust = 0;
    } else {
        top_adjust =  top_position;
    }
    
    $("#column1 h1").css({"top":top_adjust + "px", "position":"relative"});
    $("#column1 #links").css({"top":(top_adjust + col1_h1_height) + "px", "position":"absolute"});
    //$("#column1 #links").css({"top":(total_height - links_height) + "px", "position":"absolute"});
    //$("#column1 #contact_info").css({"top":(top_adjust + col1_h1_height)  + "px", "position":"absolute"});
    $("#column2 ul").css({"top":(top_adjust + col1_baseline) + "px", "position":"relative"});
    $("#column3 .content").css({"top":(top_adjust + col1_baseline) + "px", "position":"absolute"});
    
    
    //console.debug($("#column3").scrollTop() );
    //$("#awards_and_recognition").css({"top":(top_adjust + col1_baseline + col2_li_bottom_margin*0.85) + "px", "position":"absolute"});
    
    /*
    $("#nav_obscure_top").width($("#column2").width());
    $("#nav_obscure_top").height(top_adjust + 25);
    $("#nav_obscure_top").css({"top":"0px", "left":$("#column1").width()+"px","position":"absolute"});
    
    $("#nav_obscure_bottom").width($("#column2").width());
    $("#nav_obscure_bottom").height(total_height - (top_adjust + $("#column2 ul").outerHeight(true)) );
    $("#nav_obscure_bottom").css({"top":(top_adjust + $("#column2 ul").outerHeight(true) + 20)+"px", "left":$("#column1").width()+"px","position":"absolute"});
    */
}

function showPage() {
    dur = 500.0;
    overlap = 0.75;
    $("#column1,#column2,#column3").removeClass("invisible");
    $("#column1,#column2,#column3").css({"display":"none"});
    $("#column1").fadeIn({duration:dur, progress:function(a, b, c) {
        if ( c < dur * overlap ) {
            $("#column2").fadeIn({duration:dur, progress:function(a, b, c) {
                if ( c < dur * overlap ) {
                    $("#column3").fadeIn(dur);
                }
            }});
        }
        //console.debug(c);
    }});
}

function showContent(content_id) {
    dur = 500.0;
    overlap = 0.5;
    curr_content = $("#column3 .content.active");
    //$("#column3 .content.active").addClass("deactivating");
    //$("#"+content_id).addClass("active invisible");
    scalePage();
    
    $("#column3").animate(
        {scrollTop: 0},
        {   duration: dur * overlap}
    );
    curr_content.fadeOut(
        {   duration: dur,
            progress: function(a, b, c) {
                if ( c < dur * overlap ) {
                    $("#"+content_id).removeClass("invisible");
                    $("#column3").scrollTop(0);
                    $("#"+content_id).fadeIn(
                        {   duration:dur,
                            complete: function() {
                                $("#"+content_id).addClass("active");
                            }
                        }
                    );
                }
            },
            complete: function() {
                curr_content.removeClass("active");
                curr_content.addClass("invisible");
            }
        }
    );
    /*
    $("#"+content_id).css({"display":"none"});
    $("#column3 .content.active").fadeOut(
        {   duration:250,
            progress: function(a, b, c) {
                if ( c < dur * overlap ) {
                    $("#"+content_id).fadeIn(250);
                }
            },
            complete: function() {
                $("#column3 .content.active").removeClass("active");
                $("#"+content_id).addClass("active");
            },
            always: function() {
            }
        }
    );
    console.debug(content_id);
    */
}

// hide the content to avoid annoying flash of un placed content
//$("#uber").prepend("<div id=\"obscure\"></div>");
//$("#obscure").width($(window).outerWidth());
//$("#obscure").height($(window).outerHeight());


// Code to run when the page is ready
$(document).ready(function(){
    $("#column2").append("<ul></ul>");
    $("#column3 .content").each(function(index){
        $("#column2 ul").append("<li>"+jQuery.trim($(this).children(".section_title").text())+"</li>");
        if ( $(this).attr("id") == "summary" ) {
            $(this).addClass("active");
        } else {
            //$(this).addClass("invisible");
            $(this).hide();
        }
    });
    $("#links p").mouseenter(function(event) {
        $(event.delegateTarget).css("cursor","pointer");
        $(event.delegateTarget).addClass("hovered");
    });
    $("#links p").mouseleave(function(event) {
        $(event.delegateTarget).css("cursor","auto");
        $(event.delegateTarget).removeClass("hovered");
    });
    //$("#links p").click(function(event) {
    //    window.location.href = 'pdf/MichaelSachs.pdf';
    //});
    
    //$("#column2").prepend("<div id=\"nav_obscure_top\"></div>");
    //$("#column2").append("<div id=\"nav_obscure_bottom\"></div>");
    scalePage();
    showPage();
    //$("#obscure").fadeOut(1000, function() {
    //});
});

// Code to run when the window is resized
$(window).resize(function(){

    scalePage();
    

});