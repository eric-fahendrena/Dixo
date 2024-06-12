/**
 * Copyright 2024, Eric Fahendrena
 */

/**
 * lang
 * @var {String}
 */
var lang = 'en';

/**
 * handle scroll events
 * @param   {object} data
 */
function handleScrollEvents(data) {
    let sliceCounter = 1;

    $(document).on('scroll', e => {
        let wordsListRect = $('#wordsList').get()[0].getBoundingClientRect();
        
        if (wordsListRect.bottom <= window.innerHeight) {
            let search = $('#search').val();
            let list = data[lang].filter(item => (new RegExp(`^${search}`, 'i')).test(item.word));
            let sliceData = list.slice(sliceCounter * 10, (sliceCounter * 10) + 10);
            
            sliceData.forEach(dict => {
                let listItem = document.createElement('div');

                $(listItem).addClass('word-item border-bottom');
                $(listItem).html(`
                    <div class="container">
                        <h5>${dict.word} ${dict.ipa1} ${dict.ipa2}</h5>
                        <p class="senses mx-3 fs-5">${dict.senses.join(', ')}</p>
                    </div>
                `);

                $('#wordsList').append(listItem);

                handleWordOnClickEvents(listItem, dict);
            });

            sliceCounter++;
        }
    });
}

/**
 * show words list
 * @param   {object} data
 */
function showList(data) {
    $('#wordsList').html('');

    let search = $('#search').val();
    let list = data[lang].filter(item => (new RegExp(`^${search}`, 'i')).test(item.word));
    let sliceData = list.slice(0, 10);

    if (list.length > 0) {
        sliceData.forEach(dict => {
            let listItem = document.createElement('div');

            $(listItem).addClass('word-item border-bottom');
            $(listItem).html(`
                <div class="container">
                    <h5>${dict.word} ${dict.ipa1} ${dict.ipa2}</h5>
                    <p class="senses mx-1 mx-md-3 fs-5">${dict.senses.join(', ')}</p>
                </div>
            `);

            $('#wordsList').append(listItem);

            handleWordOnClickEvents(listItem, dict);
        });

        handleScrollEvents(data);
    } else {
        // No word found

        // try to toggle the language
        toggleLang();
        
        // try to get the list again from the other language
        list = data[lang].filter(item => (new RegExp(`^${search}`, 'i')).test(item.word));
        
        // verify again if list is not empty
        if (list.length > 0) {
            showList(data);
        } else {
            // always empty
            $('#wordsList').append(`
                <div class="p-5 h4 text-center" style="color: #DDD8;">
                    Aucun mot commençant par '${search.toLowerCase()}' n'est trouvé!
                </div>
            `);
        }
    }
}

/**
 * toggle lang
 * @param   {object} data
 */
function toggleLang() {
    if (lang === 'en') {
        lang = 'fr';
        $('#langToggler img').attr({
            src: 'images/flag1.png',
            alt: 'Drapeau Anglais',
        });
    } else {
        lang = 'en';
        $('#langToggler img').attr({
            src: 'images/flag2.png',
            alt: 'Drapeau Français',
        });
    }
}

/**
 * handle on click events on word item
 * @param   {HTMLDivElement} item
 * @param   {object} dict
 */
function handleWordOnClickEvents(item, dict) {
    $(item).on('click', e => {
        $('#sensesList').html('');
        
        const header = document.createElement('div');
        const word = document.createElement('div');
        const xBtn = document.createElement('button');
        const sensesCont = document.createElement('div');
        const senses = document.createElement('ul');

        $(header).addClass('d-flex align-items-center justify-content-between p-4 shadow mb-1');
        $(word).addClass('h3');
        $(xBtn).addClass('btn-close btn-close-white');

        $(sensesCont).addClass('h-75 overflow-y-scroll');
        $(senses).addClass('list-unstyled');

        $(word).html(`${dict.word} ${dict.ipa1} ${dict.ipa2}`);
        // $(xBtn).html('<i class="bi-x"></i>');

        $(header).append(word);
        $(header).append(xBtn);

        for (let i = 0; i < dict.senses.length; i++) {
            const sensesItem = document.createElement('li');
            
            $(sensesItem).addClass('item');
            $(sensesItem).html(`<div class="px-4 py-3 fs-5">${dict.senses[i]}</div>`);

            // senses item on click events
            $(sensesItem).on('click', e => {
                toggleLang();
                $('#search').val(dict.senses[i]);
                $('#search').focus();
                xBtn.click();
            });

            $(sensesItem).on('touch', e => {
                $(this).addClass('hovered');
            });

            $(senses).append(sensesItem);
        }

        $(sensesCont).append(senses);
        
        $('#sensesList').append(header);
        $('#sensesList').append(sensesCont);
        $('#sensesListContainer').removeClass('d-none');
        $('#sensesList').removeClass('d-none');
        
        // listen to events

        $(xBtn).on('click', e => {
            $('#sensesList').html('');
            $('#sensesListContainer').addClass('d-none');
            $('#sensesList').addClass('d-none');
        });

        $(document).on('keyup', e => {
            if (e.key === 'Escape') xBtn.click();
        });
    });
}

function escapeHTML(unsafe) {
    return unsafe.replace(/[&<"']/g, function (m) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[m];
    });
}

/**
 * when document is ready
 */
$(document).ready(function(){
    fetch('/api/data')
    .then(response => response.json())
    .then(data => {
        $('#search').get()[0].focus();

        showList(data, $('#lang').val());

        $('#langToggler').on('click', e => {
            $('#wordsList').html('');
            toggleLang(data);
            showList(data);
        });

        $('#search').on('focus', e => {
            showList(data);
        });

        $('#search').on('input', e => {
            showList(data);
        });
    })
    .catch(error => {
        console.error(error);
    });
});
