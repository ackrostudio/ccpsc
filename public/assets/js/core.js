/* -----------------------------------------------------------------------------

Zysk - Business & Finance HTML5 Template

File:           JS Core
Version:        1.0
Last change:    14/09/15 
Author:         Suelo

-------------------------------------------------------------------------------- */

"use strict";

var $html = $('html'),
    $body = $('body'),
    $bodyWrapper = $('#body-wrapper'),
    $pageLoader = $('#page-loader'),
    $searchToggle = $('#search-toggle'),
    $searchPopup = $('#search-popup');

/* Header Function */

var $header = $('#header'),
    $navBar = $('#nav-bar'),
    headerHeight = $header.height(),
    stickyBarrier = $(window).height()-$navBar.height()-2,
    outBarrier = $header.height()*2,
    scrolled = 0,
    $backToTop = $('#back-to-top');

window.setHeader = function() {
    scrolled = $(window).scrollTop();

    if(scrolled > headerHeight && !$header.hasClass('fixed')) {
        $header.addClass('fixed');
        if(!$header.hasClass('absolute')) { $bodyWrapper.css('padding-top',headerHeight+'px'); }
    } else if(scrolled <= headerHeight && $header.hasClass('fixed')) {
        $header.removeClass('fixed');
        if(!$header.hasClass('absolute')) { $bodyWrapper.css('padding-top',0); }
    }

    if(scrolled > outBarrier && !$header.hasClass('out')) {
        $header.addClass('out');
    } else if(scrolled <= outBarrier && $header.hasClass('out')) {
        $header.removeClass('out');
    }

    if(scrolled > stickyBarrier && !$header.hasClass('sticky')) {
        $header.addClass('sticky');
        $body.addClass('sticky-header');
    } else if(scrolled <= stickyBarrier && $header.hasClass('sticky')) {
        $header.removeClass('sticky');
        $body.removeClass('sticky-header');
    }

    if(scrolled > $(window).height() && !$backToTop.hasClass('visible')) {
        $backToTop.addClass('visible');
    } else if(scrolled <= $(window).height() && $backToTop.hasClass('visible')) {
        $backToTop.removeClass('visible');
    }
}

/* Main Functions */

var Zysk = {
    init: function() {

        this.Basic.init();
        this.Component.init(); 
        
    },
    Basic: {
        init: function() {

            this.mobileDetector();
            this.backgrounds();
            this.masonry();
            this.navigation();
            this.filter();
            this.scroller();

        },
        mobileDetector: function () {

            var isMobile = {
                Android: function() {
                    return navigator.userAgent.match(/Android/i);
                },
                BlackBerry: function() {
                    return navigator.userAgent.match(/BlackBerry/i);
                },
                iOS: function() {
                    return navigator.userAgent.match(/iPhone|iPad|iPod/i);
                },
                Opera: function() {
                    return navigator.userAgent.match(/Opera Mini/i);
                },
                Windows: function() {
                    return navigator.userAgent.match(/IEMobile/i);
                },
                any: function() {
                    return isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows();
                }
            };

            window.trueMobile = isMobile.any();

        },
        backgrounds: function() {

            // Image
            $('.bg-image, .post-wide .post-image').each(function(){
                var src = $(this).children('img').attr('src');
                $(this).css('background-image','url('+src+')').children('img').hide();
            });

            // Parallax 
            $('.bg-parallax').parallax({
                zIndex: 0
            });

            // Slideshow 
            $('.bg-slideshow').owlCarousel({
                singleItem: true,
                autoPlay: 4000,
                pagination: false,
                navigation: false,
                navigationText: false,
                slideSpeed: 1500,
                transitionStyle: 'fade',
                mouseDrag: false,
                touchDrag: false
            });

            // Video 
            var $bgVideo = $('.bg-video');
            if($bgVideo) {
                $bgVideo.YTPlayer();
            }
            if(trueMobile && $bgVideo.hasClass('bg-video')) {
                $bgVideo.next('.bg-video-placeholder').show();
                $bgVideo.remove()
            }

        },
        animations: function() {

            // Animation - appear 
            $('.animated').appear(function() {
                $(this).each(function(){ 
                        var $target =  $(this);
                        var delay = $(this).data('animation-delay');
                        setTimeout(function() {
                            $target.addClass($target.data('animation')).addClass('visible')
                        }, delay);
                });
            });

        },
        masonry: function() {

            var $grid = $('.masonry','#content');

            if($grid.length) {

                $grid.masonry({
                    columnWidth: '.masonry-sizer',
                    itemSelector: '.masonry-item',
                    percentPosition: true
                });

                $grid.imagesLoaded().progress(function() {
                    $grid.masonry('layout');
                });

                $grid.on('layoutComplete', Waypoint.refreshAll());

            }

        },
        navigation: function() {

            var $nav = $('#nav-primary'),
                $toggleItem = $nav.find('.has-dropdown').children('a'),
                $navToggle = $('#mobile-nav-toggle');

            $navToggle.on('click', function() {
                $(this).toggleClass('active');
                $body.toggleClass('mobile-nav-open');
                $nav.slideToggle(300);

                return false;
            });

            $toggleItem.on('click', function(){

                if($(window).width() < 1200) {
                    $(this).next('ul').slideToggle(300);
                }

                return false;
            });

            window.setNavPrimary = function() {
                if($(window).width() >= 1200) {
                    $nav.show();
                    $toggleItem.next('ul').each(function(){
                        $(this).show();
                    })
                }
                if($(window).width() < 1200) {
                    $nav.hide();
                    $body.removeClass('mobile-nav-open');
                    $navToggle.removeClass('active');
                }
            }

        },
        scroller: function() {

            var $header = $('#header');
            var headerHeight = $('#nav-bar').height();
            var $mobileNav = $('#mobile-nav');
            var $section = $('section','#content');
            var scrollOffset = 0;
            scrollOffset = -headerHeight;
            var $scrollers = $('[data-local-scroll]');

            if($body.hasClass('one-page')) $scrollers = $('#header, [data-local-scroll]');

            $scrollers.find('a').on('click', function(){
                $(this).blur();
            });

            $scrollers.localScroll({
                offset: scrollOffset,
                duration: 800,
                easing: 'easeOutCubic'
            });

            var $menuItem = $('#nav-primary li > a');

            var checkMenuItem = function(id) {
                $menuItem.each(function(){
                    var link = $(this).attr('href');
                    if(id==link) $(this).addClass('active');
                    else $(this).removeClass('active');
                });
            }
            $section.waypoint({
                handler: function(direction) {
                    if(direction=='up') {
                        var id = '#'+this.element.id;
                        checkMenuItem(id);
                    }
                },
                offset: function() {
                    return -this.element.clientHeight+headerHeight;
                }
            });
            $section.waypoint({
                handler: function(direction) {
                    if(direction=='down') {
                        var id = '#'+this.element.id;
                        checkMenuItem(id);
                    }
                },
                offset: function() {
                    return headerHeight+1;
                }
            });
            $(window).resize(function(){
                setTimeout(function(){
                    Waypoint.refreshAll()
                },600);
            });

        },
        filter: function() {

            var $filterBar = $('.filter-bar','#content'),
                $filter = $('.filter','#content'),
                $filterOpacity = $('.filter-opacity','#content'),
                $filterIsotope = $('.filter-isotope','#content'),
                $list,
                filterValue;

            if($filterBar.length > 0) {
         
                var $selector = $filterBar.find('.selector');

                window.setFilterSelector = function() {
                    var $activeFilter = $filterBar.find('.filter li.active');
                    $selector.css({
                        'width': $activeFilter.width()+'px',
                        'left': $activeFilter.offset().left+'px'
                    });
                }

                setFilterSelector(); 

            }

            if($filterOpacity.length>0) {

                $filterOpacity.on('click', 'a', function(){

                    $list = $($(this).parents('.filter').data('filter-list'));
                    filterValue = $(this).attr('data-filter');

                    $list.children().filter('.not-matched').removeClass('not-matched')
                    if(filterValue!="*") $list.children().not(filterValue).addClass('not-matched')

                    $(this).parents('ul').find('.active').removeClass('active');
                    $(this).parent('li').addClass('active');

                    setFilterSelector(); 

                    return false;
                });
                
            }


            if($filterIsotope.length>0) {

                $filterIsotope.each(function(){
                    $list = $($(this).data('filter-list'));
                    if($list.hasClass('masonry')) {
                        $list.isotope({
                            itemSelector: '.masonry-item',
                            percentPosition: true,
                            masonry: {
                                columnWidth: '.masonry-sizer'
                            }
                        });
                    }
                    else $list.isotope();
                });

                $filterIsotope.on('click', 'a', function(){

                    $list = $($(this).parents('.filter-isotope').data('filter-list'));
                    filterValue = $(this).attr('data-filter');

                    $list.isotope({
                        filter: filterValue
                    });

                    $(this).parents('ul').find('.active').removeClass('active');
                    $(this).parent('li').addClass('active');

                    return false;
                });

            }

        }  
    },
    Component: {
        init: function() {  

            this.backTotop();
            this.carousel(); 
            this.counterdown();
            this.lightbox();
            this.twitterFeed();
            this.forms();
            this.modal();
            this.instagramFeed();
            this.searchPopup();
            this.sidePanel();
            this.slider();
            this.videoBox();

        },
        backTotop: function() {
            
            if($backToTop.length) {

                $backToTop.on('click', function(){
                    $('html,body').animate({
                        scrollTop: 0
                    }, 1000, 'easeInCubic');
                    return false;
                });

            }

        },
        carousel: function() {

            var $carousel = $('.carousel');

            if($carousel.length) {

                $carousel.each(function(){

                    var items, singleItem, autoPlay, transition, drag, stopOnHover, navigation, pagination;

                    items = $(this).data('items');

                    singleItem = $(this).data('single-item')===undefined ? false : true;
                    autoPlay =  $(this).data('autoplay');
                    transition = $(this).data('transition')===undefined ? false : $(this).data('transition');
                    pagination = $(this).data('pagination')===undefined ? false : true;
                    navigation = $(this).data('navigation')===undefined ? false : true;
                    drag = transition=="fade" ? false : true;
                    stopOnHover = transition==="fade" || pagination===false || navigation===false ? false : true;

                    $(this).owlCarousel({
                        items: items,
                        itemsDesktop: [1199,Math.ceil(items*0.6)], 
                        itemsDesktopSmall: [991,Math.ceil(items*0.5)],
                        itemsTablet: [768,Math.ceil(items*0.4)],
                        itemsMobile: [479,Math.ceil(items*0.2)],
                        singleItem: singleItem,
                        autoPlay: autoPlay,
                        pagination: pagination,
                        navigation: navigation,
                        navigationText: false,
                        slideSpeed: 800,
                        stopOnHover: stopOnHover,
                        transitionStyle: transition,
                        mouseDrag: drag,
                        touchDrag: drag,
                        addClassActive: true
                    });

                });

            }
            
        },
        cookiePopup: function() {

            function setCookie(cname, cvalue, exdays) {
                var d = new Date();
                d.setTime(d.getTime() + (exdays*24*60*60*1000));
                var expires = "expires="+d.toUTCString();
                document.cookie = cname + "=" + cvalue + "; " + expires;
            }

            function getCookie(cname) {
                var name = cname + "=";
                var ca = document.cookie.split(';');
                for(var i = 0; i < ca.length; i++) {
                    var c = ca[i];
                    while (c.charAt(0) == ' ') {
                        c = c.substring(1);
                    }
                    if (c.indexOf(name) == 0) {
                        return c.substring(name.length, c.length);
                    }
                }
                return "";
            }

            var cookieStatus = getCookie('cookieStatus');

            if(cookieStatus == '') {
                $body.append('<div id="tmp_container"></div>')
                var $tmp = $('#tmp_container');

                $tmp.load('assets/api/cookies-popup.html', function(){

                    $body.append($tmp.html());
                    $tmp.remove();

                    var $cookiePopup = $('#modalCookies');

                    setTimeout(function(){
                        $cookiePopup.modal('show')
                        $body.addClass('modal-at-bottom');
                    }, 1000);

                    $cookiePopup.on('hide.bs.modal', function (e) {
                        setCookie('cookieStatus',true,365);
                        $body.removeClass('modal-at-bottom');
                    });

                });
            }

        },
        counterdown: function() {

            var $countdown = $('.countdown');

            if($countdown.length) {

                $countdown.each(function(){

                    var date = $(this).data('date'),
                        labels = eval($(this).data('labels'));

                    $(this).countdown(date, function(event) {
                        var format = '<span class="time">%H:%M<span>:%S</span></span>';
                        if(event.offset.days > 0) {
                        format = '<span class="days">%-d <span>' + labels[1] + '</span></span> ' + format;
                            }
                        if(event.offset.weeks > 0) {
                        format = '<span class="weeks">%-w <span>' + labels[0] + '</span></span> ' + format;
                            }
                        $(this).html(event.strftime(format));
                    });

                }); 

            }

        },
        forms: function(){

            /* Notification Bar */
            var $notificationBar = $('#notification-bar'),
                $notificationClose = $('#notification-bar').find('.close');

            var showNotification = function(type,msg) {
                $notificationBar.html('<div class='+type+'>'+msg+'<a href="#" class="close"><i class="ti-close"></i></a></div>');
                setTimeout(function(){
                    $notificationBar.addClass('visible');
                }, 400);
                setTimeout(function(){
                    $notificationBar.removeClass('visible');
                }, 10000);
            };

            $body.delegate('#notification-bar .close','click', function(){
                closeNotification();
                return false;
            });

            var closeNotification = function() {
                $notificationBar.removeClass('visible');
            }

            /* Validate Form */
            var $validateForm = $('.validate-form');

            if($validateForm.length) {

                $('.validate-form').each(function(){
                    $(this).validate({
                        validClass: 'valid',
                        errorClass: 'error',
                        onfocusout: function(element,event) {
                            $(element).valid();
                        },
                        errorPlacement: function(error,element) {
                            return true;
                        },
                        rules: {
                            email: {
                                required    : true,
                                email       : true
                            }
                        }
                    });
                });

            }

            // Sign Up
            var $signUpForm  = $('.sign-up-form');

            if($signUpForm.length) {
            
                $signUpForm.submit(function() {
                    var $btn = $(this).find('.btn-submit'),
                        $form = $(this),
                        response,
                        msgSuccess = $(this).data('message-success'),
                        msgError = $(this).data('message-error');

                    if ($form.valid()){
                        $btn.addClass('loading');
                        $.ajax({
                            type: $form.attr('method'),
                            url:  $form.attr('action'),
                            data: $form.serialize(),
                            cache       : false,
                            dataType    : 'jsonp',
                            jsonp: 'c',
                            contentType: "application/json; charset=utf-8",
                            error       : function(err) { setTimeout(function(){ $btn.addClass('error'); }, 1200); },
                            success     : function(data) {
                                if(data.result != 'success'){
                                    showNotification('error',msgError);
                                } else {
                                    showNotification('success',msgSuccess);
                                }
                            },
                            complete: function(data) {
                                $btn.removeClass('loading');
                            }
                        });
                        return false;
                    }
                    return false;
                });

            }

            // Contact Form
            var $contactForm  = $('.contact-form');

            if($contactForm.length) {
            
                $contactForm.submit(function() {
                    var $btn = $(this).find('.btn-submit'),
                        $form = $(this),
                        response,
                        msgSuccess = $(this).data('message-success'),
                        msgError = $(this).data('message-error');

                    if ($form.valid()){
                        $btn.addClass('loading');
                        $.ajax({
                            type: 'POST',
                            url:  'assets/php/contact-form.php',
                            data: $form.serialize(),
                            error       : function(err) { setTimeout(function(){ $btn.addClass('error'); }, 1200); },
                            success     : function(data) {
                                if (data != "success") {
                                    response = 'error';
                                    showNotification('error',msgError);
                                } else {
                                    response = 'success';
                                    showNotification('success',msgSuccess);
                                }
                                setTimeout(function(){
                                    $btn.addClass(response);
                                }, 400);
                            },
                            complete: function(data) {
                                setTimeout(function(){
                                    $btn.removeClass('loading error success');
                                }, 10000);
                            }
                        });
                        return false;
                    }
                    return false;
                });

            }

        },
        instagramFeed: function(){

            var $instagramFeed = $('#instagram-feed');

            if($instagramFeed.length) {
                var limit =  $instagramFeed.data('limit'),
                    res = $instagramFeed.data('resolution') ? $instagramFeed.data('resolution') : 'thumbnail';
                var feed = new Instafeed({
                    accessToken: '2969283166.1677ed0.e859dad53f0b4f6cab807252cb20a682',
                    userId: '2969283166',
                    get: 'user',
                    target: 'instagram-feed',
                    template: '<a href="{{link}}" target="_blank"><img src="{{image}}" /></a>',
                    limit: limit,
                    resolution: res
                });
                feed.run();
            }

        },
        lightbox: function() {

            lightbox.option({
                'disableScrolling': true
            });

        },
        modal: function() {

            $('.modal[data-timeout]').each(function(){
                var timeout = $(this).data('timeout'),
                    $this = $(this);
                setTimeout(function() {
                    $this.modal('show');
                }, timeout)
            });

            $('[data-toggle="video-modal"]').on('click', function() {
                var modal = $(this).data('target'),
                    video = $(this).data('video')

                $(modal + ' iframe').attr('src', video + '?autoplay=1');
                $(modal).modal('show');

                $(modal).on('hidden.bs.modal', function () {
                    $(modal + ' iframe').removeAttr('src');
                })

                return false;
            });

        },
        searchPopup: function() {

            $searchToggle.on('click', function(){
                $(this).toggleClass('active');
                $searchPopup.toggleClass('visible');
                return false;
            });

        },
        sidePanel: function() {

            if($('#side-panel').length) {

                $('[data-toggle="side-panel"]').on('click', function(){
                    $body.toggleClass('side-panel-open');
                    return false;
                });

                $('.nav-panel a').on('click', function(){
                    if($(this).attr('href').indexOf('.html') == -1) {
                        $body.removeClass('side-panel-open');
                        return false;
                    }
                })

            }
        },
        slider: function() {

            var $formSlider =  $('.form-slider');

            if($formSlider.length) {

                $('.form-slider').each(function(){
                    var value = $(this).data('value'),
                        min = $(this).data('min'),
                        max = $(this).data('max'),
                        targetInput = $(this).data('input')

                    $(this).slider({
                        range: "min",
                        value: value,
                        min: min,
                        max: max,
                        slide: function(event,ui) {
                            $(targetInput).val(ui.value).trigger('change');
                        }
                    });
                });

                $('.slider-control').on('input', function(){
                    $($(this).data('slider')).slider('value', $(this).val());
                });

            }

        },
        twitterFeed: function() {

            var $twitterFeed = $('.twitter-feed');

            if($twitterFeed.length) {

                $twitterFeed.each(function() {
                    var count = $(this).data("count");
                    $(this).twittie({
                        apiPath: 'assets/api/twitter/tweet.php',
                        count: count,
                        template: '{{tweet}} - <span class="date">{{date}}</span>'
                    });
                });

            }

        },
        videoBox: function() {

            $('.video-box.placeholder-image .btn-play').on('click', function(){
                var video = '<iframe src="' + $(this).attr('href') + '" autoplay="1"></iframe>';
                var $container =  $(this).parents('.video-box');
                $container.addClass('playing');
                var width = $container.outerWidth();
                var height = $container.outerHeight();

                $(this).siblings('.image').html(video);
                $container.find('iframe').css({
                    'width': width + 'px',
                    'height': height + 'px'
                });
                return false;
            });

        }
    }
};

$(document).ready(function (){
    Zysk.init();
});

$(window).scroll(function(){
    setHeader();
    if($searchPopup.length > 0 && $searchPopup.hasClass('visible')) {
        $searchToggle.removeClass('active');
        $searchPopup.removeClass('visible');
    }

});

$(window).resize(function(){
    setNavPrimary();
    if($('.filter-bar','#content').length) setFilterSelector(); 
})

$(window).load(function(){
    if($pageLoader.length != 0) {
        $pageLoader.fadeOut(600, function(){
            Zysk.Basic.animations();
            Zysk.Component.modal(); 
            if($html.data('cookies-popup') == true) {
                Zysk.Component.cookiePopup(); 
            };
        });
    } else {
        Zysk.Basic.animations();
        Zysk.Component.modal();
        if($html.data('cookies-popup') == true) {
            Zysk.Component.cookiePopup(); 
        };
    }
});

