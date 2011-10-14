google.setOnLoadCallback(function() {
    $('.location a').show().toggle(function() {
        $('.hide', $(this).parent()).show();
    }, function() {
        $('.hide', $(this).parent()).hide();
    });
{% if ENABLE_TRANSLATION_SUGGESTIONS %}    
    $('a.suggest').click(function() {
        var a=$(this), 
            str=a.html(), 
            orig=$('.original .message', 
            a.parents('tr')).html(), 
            trans=$('textarea',a.parent());
        orig = unescape(orig).replace(/<br\s?\/?>/g,'\n').replace(/<code>/g,'').replace(/<\/code>/g,'').replace(/&gt;/g,'>').replace(/&lt;/g,'<');
        a.attr('class','suggesting').html('...');
        google.language.translate(orig, '{{MESSAGES_SOURCE_LANGUAGE_CODE}}', '{{rosetta_i18n_lang_code|slice:":2"}}', function(result) {
            if (!result.error) {
                trans.val(unescape(result.translation).replace(/&#39;/g,'\'').replace(/&quot;/g,'"').replace(/%\s+(\([^\)]+\))\s*s/g,' %$1s '));
                a.hide();
            } else {
                a.hide().before($('<span class="alert">'+result.error.message+'</span>'));
            }
        });
        return false;
    });
    
    
    $('#translate-all').submit(function() {
        $('a.suggest').click();
        return false;
    });
    $('.checkall').click(function(){
        $('td.c input').attr('checked', '');
        $('td.c input').attr('value', '0');
    });
    
    
    
{% endif %}
    $('td.plural').each(function(i) {
        var td = $(this), trY = parseInt(td.closest('tr').offset().top);
        $('textarea', $(this).closest('tr')).each(function(j) {
            var textareaY=  parseInt($(this).offset().top) - trY;
            $($('.part',td).get(j)).css('top',textareaY + 'px');
        });
    });
    
    var validate_trads = function(RX, el) {
        var origs=$('.original', $(el).parents('tr')).html().match(RX),
            trads=$(el).val().match(RX),
            error = $('<span class="alert">Unmatched variables</span>');
            
        if (origs && trads) {
            for (var i = trads.length; i--;){
                var key = trads[i];
                if (-1 == $.inArray(key, origs)) {
                    $(el).before(error);
                    return false;
                }
            }
            return true;
        } else {
            if (!(origs === null && trads === null)) {
                $(el).before(error);
                return false;
            }
        }
        return true;        
    }
    
    $('.translation textarea').blur(function() {
        if($(this).val()) {
            $('.alert', $(this).parents('tr')).remove();
            var var_formats = [
                /%(?:\([^\s\)]*\))?[sdf]/g,            // Python string formatting
                /%(?:\d+\$)?(?:\d+\.)?(?:\d+)?[sdf]/g, // PHP sprintf (tested with ['%1$d', '%1$04d', '%04d', '%0.4d', '%s'])
                /%\w+%/g,                              // Symfony i18n string tokens
                ],
                element = this;
            
            results = $(var_formats).map(function(index,RX) {
                return validate_trads(RX, element);
            });
            
            ret = true;
            for (var i = results.length; i --;){
                ret = ret && results[i];
            }
            
            return ret;
        }
    });

    $('.translation textarea').eq(0).focus();
    
});
