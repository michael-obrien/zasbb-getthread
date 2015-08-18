//modified version of the code found @:
  //http://coursesweb.net/javascript/convert-bbcode-html-javascript_cs

var BBCodeHTML = function() {
  var me = this;            // stores the object instance
  var token_match = /{[A-Z_]+[0-9]*}/ig;

  // regular expressions for the different bbcode tokens
  var tokens = {
    'URL' : '((?:(?:[a-z][a-z\\d+\\-.]*:\\/{2}(?:(?:[a-z0-9\\-._~\\!$&\'*+,;=:@|]+|%[\\dA-F]{2})+|[0-9.]+|\\[[a-z0-9.]+:[a-z0-9.]+:[a-z0-9.:]+\\])(?::\\d*)?(?:\\/(?:[a-z0-9\\-._~\\!$&\'*+,;=:@|]+|%[\\dA-F]{2})*)*(?:\\?(?:[a-z0-9\\-._~\\!$&\'*+,;=:@\\/?|]+|%[\\dA-F]{2})*)?(?:#(?:[a-z0-9\\-._~\\!$&\'*+,;=:@\\/?|]+|%[\\dA-F]{2})*)?)|(?:www\\.(?:[a-z0-9\\-._~\\!$&\'*+,;=:@|]+|%[\\dA-F]{2})+(?::\\d*)?(?:\\/(?:[a-z0-9\\-._~\\!$&\'*+,;=:@|]+|%[\\dA-F]{2})*)*(?:\\?(?:[a-z0-9\\-._~\\!$&\'*+,;=:@\\/?|]+|%[\\dA-F]{2})*)?(?:#(?:[a-z0-9\\-._~\\!$&\'*+,;=:@\\/?|]+|%[\\dA-F]{2})*)?)))',
    'LINK' : '([a-z0-9\-\./]+[^"\' ]*)',
    'EMAIL' : '((?:[\\w\!\#$\%\&\'\*\+\-\/\=\?\^\`{\|\}\~]+\.)*(?:[\\w\!\#$\%\'\*\+\-\/\=\?\^\`{\|\}\~]|&)+@(?:(?:(?:(?:(?:[a-z0-9]{1}[a-z0-9\-]{0,62}[a-z0-9]{1})|[a-z])\.)+[a-z]{2,6})|(?:\\d{1,3}\.){3}\\d{1,3}(?:\:\\d{1,5})?))',
    'TEXT' : '(.*?)',
    'SIMPLETEXT' : '([a-zA-Z0-9-+.,_ ]+)',
    'INTTEXT' : '([a-zA-Z0-9-+,_. ]+)',
    'IDENTIFIER' : '([a-zA-Z0-9-_]+)',
    'COLOR' : '([a-z]+|#[0-9abcdef]+)',
    'NUMBER'  : '([0-9]+)'
  };

  var bbcode_matches = [];        // matches for bbcode to html

  var html_tpls = [];             // html templates for html to bbcode

  var html_matches = [];          // matches for html to bbcode

  var bbcode_tpls = [];           // bbcode templates for bbcode to html

  /**
   * Turns a bbcode into a regular rexpression by changing the tokens into
   * their regex form
   */
  var _getRegEx = function(str) {
    var matches = str.match(token_match);
    var nrmatches = matches.length;
    var i = 0;
    var replacement = '';

    if (nrmatches <= 0) {
      return new RegExp(preg_quote(str), 'g');        // no tokens so return the escaped string
    }

    for(; i < nrmatches; i += 1) {
      // Remove {, } and numbers from the token so it can match the
      // keys in tokens
      var token = matches[i].replace(/[{}0-9]/g, '');

      if (tokens[token]) {
        // Escape everything before the token
        replacement += preg_quote(str.substr(0, str.indexOf(matches[i]))) + tokens[token];

        // Remove everything before the end of the token so it can be used
        // with the next token. Doing this so that parts can be escaped
        str = str.substr(str.indexOf(matches[i]) + matches[i].length);
      }
    }

    replacement += preg_quote(str);      // add whatever is left to the string

    return new RegExp(replacement, 'gi');
  };

  /**
   * Turns a bbcode template into the replacement form used in regular expressions
   * by turning the tokens in $1, $2, etc.
   */
  var _getTpls = function(str) {
    var matches = str.match(token_match);
    var nrmatches = matches.length;
    var i = 0;
    var replacement = '';
    var positions = {};
    var next_position = 0;

    if (nrmatches <= 0) {
      return str;       // no tokens so return the string
    }

    for(; i < nrmatches; i += 1) {
      // Remove {, } and numbers from the token so it can match the
      // keys in tokens
      var token = matches[i].replace(/[{}0-9]/g, '');
      var position;

      // figure out what $# to use ($1, $2)
      if (positions[matches[i]]) {
        position = positions[matches[i]];         // if the token already has a position then use that
      } else {
        // token doesn't have a position so increment the next position
        // and record this token's position
        next_position += 1;
        position = next_position;
        positions[matches[i]] = position;
      }

      if (tokens[token]) {
        replacement += str.substr(0, str.indexOf(matches[i])) + '$' + position;
        str = str.substr(str.indexOf(matches[i]) + matches[i].length);
      }
    }

    replacement += str;

    return replacement;
  };

  /**
   * Adds a bbcode to the list
   */
  me.addBBCode = function(bbcode_match, bbcode_tpl) {
    // add the regular expressions and templates for bbcode to html
    bbcode_matches.push(_getRegEx(bbcode_match));
    html_tpls.push(_getTpls(bbcode_tpl));

    // add the regular expressions and templates for html to bbcode
    html_matches.push(_getRegEx(bbcode_tpl));
    bbcode_tpls.push(_getTpls(bbcode_match));
  };

  /**
   * Turns all of the added bbcodes into html
   */
  me.bbcodeToHtml = function(str) {
    var nrbbcmatches = bbcode_matches.length;
    var i = 0;

    for(; i < nrbbcmatches; i += 1) {
      str = str.replace(bbcode_matches[i], html_tpls[i]);
    }

    return str;
  };

  /**
   * Turns html into bbcode
   */
  me.htmlToBBCode = function(str) {
    var nrhtmlmatches = html_matches.length;
    var i = 0;

    for(; i < nrhtmlmatches; i += 1) {
      str = str.replace(html_matches[i], bbcode_tpls[i]);
    }

    return str;
  }

  /**
   * Quote regular expression characters plus an optional character
   * taken from phpjs.org
   */
  function preg_quote (str, delimiter) {
    return (str + '').replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + (delimiter || '') + '-]', 'g'), '\\$&');
  }

  // adds BBCodes and their HTML
  me.addBBCode('[b]{TEXT}[/b]', '<strong>{TEXT}</strong>');
  me.addBBCode('[i]{TEXT}[/i]', '<em>{TEXT}</em>');
  me.addBBCode('[u]{TEXT}[/u]', '<span style="text-decoration:underline;">{TEXT}</span>');
  me.addBBCode('[s]{TEXT}[/s]', '<span style="text-decoration:line-through;">{TEXT}</span>');
  me.addBBCode('[url={URL}]{TEXT}[/url]', '<a href="{URL}" title="link" target="_blank">{TEXT}</a>');
  me.addBBCode('[url]{URL}[/url]', '<a href="{URL}" title="link" target="_blank">{URL}</a>');
  me.addBBCode('[url={LINK}]{TEXT}[/url]', '<a href="{LINK}" title="link" target="_blank">{TEXT}</a>');
  me.addBBCode('[url]{LINK}[/url]', '<a href="{LINK}" title="link" target="_blank">{LINK}</a>');
  me.addBBCode('[img={URL} width={NUMBER1} height={NUMBER2}]{TEXT}[/img]', '<img src="{URL}" width="{NUMBER1}" height="{NUMBER2}" alt="{TEXT}" />');
  me.addBBCode('[img]{URL}[/img]', '<img src="{URL}" alt="{URL}" />');
  me.addBBCode('[img={LINK} width={NUMBER1} height={NUMBER2}]{TEXT}[/img]', '<img src="{LINK}" width="{NUMBER1}" height="{NUMBER2}" alt="{TEXT}" />');
  me.addBBCode('[img]{LINK}[/img]', '<img src="{LINK}" alt="{LINK}" />');
  me.addBBCode('[color={COLOR}]{TEXT}[/color]', '<span style="color:{COLOR}">{TEXT}</span>');
  me.addBBCode('[highlight={COLOR}]{TEXT}[/highlight]', '<span style="background-color:{COLOR}">{TEXT}</span>');
  me.addBBCode('[quote="{TEXT1}"]{TEXT2}[/quote]', '<div class="quote"><cite>{TEXT1}</cite><p>{TEXT2}</p></div>');
  me.addBBCode('[quote]{TEXT}[/quote]', '<cite>{TEXT}</cite>');
  me.addBBCode('[blockquote]{TEXT}[/blockquote]', '<blockquote>{TEXT}</blockquote>');

  //CUSTOM RULES
  me.addBBCode('[Blizz]{URL} {TEXT1} {TEXT2}[/Blizz]', '<style type="text/css"> <!-- .Style1 {color: #FFCC33} .Style6 {font-size: 12px} .Style7 {color: #0099FF} --> </style> <table width="100%" border="0" cellpadding="0" cellspacing="12" background="images/blizzback.png"> <tr valign="middle"> <td><p><span class="Style1"><img src="images/blizzicon.png" width="22" height="15"><span class="Style6"><span class="Style7">Quote from </span><b><a href="{URL}">{TEXT1}</a></b></span></span></p></td></tr><tr valign="middle"><td><p align="justify" class="Style7"><span class="Style6">{TEXT2}</span></p></td></tr></table>');
  me.addBBCode('[achieve={NUMBER}]{TEXT}[/achieve]', '<a href="http://www.wowhead.com/achievement={NUMBER}">[{TEXT}]</a>');
  me.addBBCode('[armory={INTTEXT}]{TEXT}[/armory]', '<a href="http://eu.battle.net/wow/en/character/shadowsong/{INTTEXT}/advanced">{TEXT}</a>');
  me.addBBCode('[background={COLOR}]{TEXT}[/background]', '<span style="background-color: {COLOR};">{TEXT}</span>');
  //me.addBBCode('[centre]{TEXT}[/centre]', '<div style="text-align: center;">{TEXT}</div>');
  me.addBBCode('[centre]{TEXT}', '<span style="display: block; text-align: center;">{TEXT}');
  me.addBBCode('{TEXT}[/centre]', '{TEXT}</span>');
  me.addBBCode('[col]{TEXT1}|{TEXT2}[/col]', '<table width="100%"><tr><td style="vertical-align: top; width:50%; padding-right:10px;">{TEXT1}</td><td style="vertical-align: top; width:50%; padding-left:10px;">{TEXT2}</td></tr></table>');
  me.addBBCode('[col3]{TEXT1}|{TEXT2}|{TEXT3}[/col3]', '<table width="100%"><tr><td style="vertical-align: top; width:33%; padding-right:10px;">{TEXT1}</td><td style="vertical-align: top; width:33%; padding-left:10px;">{TEXT2}</td><td style="vertical-align: top; width:33%; padding-left:20px;">{TEXT3}</td></tr></table>');
  me.addBBCode('[col4]{TEXT1}|{TEXT2}|{TEXT3}|{TEXT4}[/col4]', '<table width="100%"><tr><td style="vertical-align: top; width:25%; padding-right:10px;">{TEXT1}</td><td style="vertical-align: top; width:25%; padding-left:10px;">{TEXT2}</td><td style="vertical-align: top; width:25%; padding-left:20px;">{TEXT3}</td><td style="vertical-align: top; width:25%; padding-left:20px;">{TEXT4}</td></tr></table>');
  me.addBBCode('[d3a]{INTTEXT}[/d3a]', '<a href="http://eu.battle.net/d3/en/profile/{INTTEXT}/"><span style="color:#AF833B;">D3 Profile</span></a>');
  me.addBBCode('[dk]{TEXT}[/dk]', '<span style="color:#C41F3B;">{TEXT}</span>');
  me.addBBCode('[dka]{INTTEXT}[/dka]', '<a href="http://eu.battle.net/wow/en/character/shadowsong/{INTTEXT}/advanced"><span style="color:#C41F3B;">{INTTEXT}</span></a>');
  me.addBBCode('[dr]{TEXT}[/dr]', '<span style="color:#FF7D0A;">{TEXT}</span>');
  me.addBBCode('[fimg={IDENTIFIER}]{URL}[/fimg]', '<img src="{URL}" alt="{URL}" style="float: {IDENTIFIER}};margin: 10px 10px 10px 10px" />');
  me.addBBCode('[font={SIMPLETEXT}]{TEXT}[/font]', '<span style="font-family: {SIMPLETEXT};">{TEXT}</span>');
  me.addBBCode('[hil={COLOR}]{TEXT}[/hil]', '<span style="background-color: {COLOR}">{TEXT}</span>');
  me.addBBCode('[hr]{TEXT}[/hr]', '<hr />{TEXT}');
  me.addBBCode('[ht]{TEXT}[/ht]', '<span style="color:#ABD473;">{TEXT}</span>');
  me.addBBCode('[hta]{INTTEXT}[/hta]', '<a href="http://eu.battle.net/wow/en/character/shadowsong/{INTTEXT}/advanced"><span style="color:#ABD473;">{INTTEXT}</span></a>');
  me.addBBCode('[item={NUMBER}][q={IDENTIFIER}]{TEXT}[/q][/item]', '<a class="q{IDENTIFIER}" href="http://www.wowhead.com/item={NUMBER}">[{TEXT}]</a>');
  me.addBBCode('[itemptr={NUMBER}][q={IDENTIFIER}]{TEXT}[/q][/itemptr]', '<a class="q{IDENTIFIER}" href="http://ptr.wowhead.com/item={NUMBER}">[{TEXT}]</a>');
  me.addBBCode('[justify]{TEXT}[/justify]', '<div style="text-align: justify;">{TEXT}</div>');
  me.addBBCode('[left]{TEXT}[/left]', '<div style="text-align: left;">{TEXT}</div>');
  me.addBBCode('[mg]{TEXT}[/mg]', '<span style="color:#69CCF0;">{TEXT}</span>');
  me.addBBCode('[mga]{INTTEXT}[/mga]', '<a href="http://eu.battle.net/wow/en/character/shadowsong/{INTTEXT}/advanced"><span style="color:#69CCF0;">{INTTEXT}</span></a>');
  me.addBBCode('[mk]{TEXT}[/mk]', '<span style="color:#00FF96;">{TEXT}</span>');
  me.addBBCode('[newsnav]{TEXT}[/newsnav]', '<a href="#/news/0"><img src="assets/news/icons/T17.png"></a><a href="#/news/1"><img src="assets/news/icons/T16.png"></a><a href="#/news/2"><img src="assets/news/icons/T15.png"></a><a href="#/news/3"><img src="assets/news/icons/T14.png"></a><a href="#/news/4"><img src="assets/news/icons/T13.png"></a><a href="#/news/5"><img src="assets/news/icons/T12.png"></a><a href="#/news/6"><img src="assets/news/icons/T11.png"></a><a href="#/news/7"><img src="assets/news/icons/T10.png">{TEXT}</a>');
  me.addBBCode('[npc={NUMBER}]{TEXT}[/npc]', '<a href="http://www.wowhead.com/npc={NUMBER}">[{TEXT}]</a>');
  me.addBBCode('[npcptr={NUMBER}]{TEXT}[/npcptr]', '<a href="http://ptr.wowhead.com/npc={NUMBER}">[{TEXT}]</a>');
  me.addBBCode('[pa]{TEXT}[/pa]', '<span style="color:#F58CBA;">{TEXT}</span>');
  me.addBBCode('[paa]{INTTEXT}[/paa]', '<a href="http://eu.battle.net/wow/en/character/shadowsong/{INTTEXT}/advanced"><span style="color:#F58CBA;">{INTTEXT}</span></a>');
  me.addBBCode('[pre]{TEXT}[/pre]', '<pre>{TEXT}</pre>');
  me.addBBCode('[pt]{TEXT}[/pt]', '<span style="color:#FFFFFF;">{TEXT}</span>');
  me.addBBCode('[pta]{INTTEXT}[/pta]', '<a href="http://eu.battle.net/wow/en/character/shadowsong/{INTTEXT}/advanced"><span style="color:#FFFFFF;">{INTTEXT}</span></a>');
  me.addBBCode('[qblizz]{TEXT}[/qblizz]', '<span style="color:#0099FF;">{TEXT}</span>');
  me.addBBCode('[qcomm]{TEXT}[/qcomm]', '<span style="color:#FFFFFF;">{TEXT}</span>');
  me.addBBCode('[qepic]{TEXT}[/qepic]', '<span style="color:#A335EE;">{TEXT}</span>');
  me.addBBCode('[qheir]{TEXT}[/qheir]', '<span style="color:#E6CC80;">{TEXT}</span>');
  me.addBBCode('[qlege]{TEXT}[/qlege]', '<span style="color:#FF8000;">{TEXT}</span>');
  me.addBBCode('[qpoor]{TEXT}[/qpoor]', '<span style="color:#9D9D9D;">{TEXT}</span>');
  me.addBBCode('[qrare]{TEXT}[/qrare]', '<span style="color:#0070DD;">{TEXT}</span>');
  me.addBBCode('[quest={NUMBER}]{TEXT}[/quest]', '<a href="http://www.wowhead.com/quest={NUMBER}">[{TEXT}]</a>');
  me.addBBCode('[qunco]{TEXT}[/qunco]', '<span style="color:#1EFF00;">{TEXT}</span>');
  me.addBBCode('[rg]{TEXT}[/rg]', '<span style="color:#FFF569;">{TEXT}</span>');
  me.addBBCode('[rga]{INTTEXT}[/rga]', '<a href="http://eu.battle.net/wow/en/character/shadowsong/{INTTEXT}/advanced"><span style="color:#FFF569;">{INTTEXT}</span></a>');
  me.addBBCode('[rhead]{TEXT1}[/rhead]', '<FONT COLOR=yellow><b><i>{TEXT1}</i></b></FONT>');
  me.addBBCode('[right]{TEXT}[/right]', '<div style="text-align: right;">{TEXT}</div>');
  me.addBBCode('[sh]{TEXT}[/sh]', '<span style="color:#2459FF;">{TEXT}</span>');
  me.addBBCode('[sha]{INTTEXT}[/sha]', '<a href="http://eu.battle.net/wow/en/character/shadowsong/{INTTEXT}/advanced"><span style="color:#2459FF;">{INTTEXT}</span></a>');
  me.addBBCode('[slhead]{TEXT1},{TEXT2},{TEXT3},{TEXT4}[/slhead]', '<FONT COLOR=yellow>Invites:</FONT> <FONT COLOR=red>{TEXT1}</FONT><br /><FONT COLOR=yellow>Start:</FONT> <FONT COLOR=red>{TEXT2}</FONT><br /><FONT COLOR=yellow>RL:</FONT> {TEXT3}<br /><FONT COLOR=yellow>ML:</FONT> {TEXT4}');
  me.addBBCode('[spell={NUMBER}]{TEXT}[/spell]', '<a href="http://www.wowhead.com/spell={NUMBER}">[{TEXT}]</a>');
  me.addBBCode('[spellptr={NUMBER}]{TEXT}[/spellptr]', '<a href="http://ptr.wowhead.com/spell={NUMBER}">[{TEXT}]</a>');
  me.addBBCode('[sub]{TEXT}[/sub]', '<span style="vertical-align: sub;">{TEXT}</span>');
  me.addBBCode('[super]{TEXT}[/super]', '<span style="vertical-align: super;">{TEXT}</span>');
  me.addBBCode('[textarea]{TEXT}[/textarea]', '<div style="border: 1px solid red; padding: 10px; background-color: rgb(30, 0, 0); color: rgb(255, 255, 255);">{TEXT}</div>');
  me.addBBCode('[wk]{TEXT}[/wk]', '<span style="color:#9482C9;">{TEXT}</span>');
  me.addBBCode('[wka]{INTTEXT}[/wka]', '<a href="http://eu.battle.net/wow/en/character/shadowsong/{INTTEXT}/advanced"><span style="color:#9482C9;">{INTTEXT}</span></a>');
  me.addBBCode('[wr]{TEXT}[/wr]', '<span style="color:#C79C6E;">{TEXT}</span>');
  me.addBBCode('[wra]{INTTEXT}[/wra]', '<a href="http://eu.battle.net/wow/en/character/shadowsong/{INTTEXT}/advanced"><span style="color:#C79C6E;">{INTTEXT}</span></a>');
  //me.addBBCode('[youtube]{SIMPLETEXT}[/youtube]', '<object width="425" height="350"><param name="movie" value="http://www.youtube.com/v/{SIMPLETEXT}"></param><param name="wmode" value="transparent"></param><embed src="http://www.youtube.com/v/{SIMPLETEXT}" type="application/x-shockwave-flash" wmode="transparent" width="425" height="350"></embed></object>');
  //me.addBBCode('[ythd]{SIMPLETEXT}[/ythd]', '<object width="480" height="270"><param name="movie" value="http://www.youtube.com/v/{SIMPLETEXT}?fs=1&amp;hl=en_US&amp;vq=hd1080"></param><param name="allowFullScreen" value="true"></param><param name="allowscriptaccess" value="always"></param><embed src="http://www.youtube.com/v/{SIMPLETEXT}?fs=1&amp;hl=en_US&amp;vq=hd1080" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" width="480" height="270"></embed></object>');
  me.addBBCode('[youtube]{SIMPLETEXT}[/youtube]', '<div class="auto-resizable-iframe"><div><iframe frameborder="0" src="http://www.youtube.com/embed/{SIMPLETEXT}?rel=0" allowfullscreen="allowfullscreen"></iframe></div></div>');
  me.addBBCode('[ythd]{SIMPLETEXT}[/ythd]', '<div class="auto-resizable-iframe"><div><iframe frameborder="0" src="http://www.youtube.com/embed/{SIMPLETEXT}?rel=0&vq=hd1080" allowfullscreen="allowfullscreen"></iframe></div></div>');
  me.addBBCode('[twitch]{SIMPLETEXT}[/twitch]', '<div class="auto-resizable-iframe"><div><iframe frameborder="0" src="http://www.twitch.tv/{SIMPLETEXT}/embed" allowfullscreen="true"></iframe></div></div>');
  me.addBBCode('\n{TEXT}', '<br />{TEXT}');
};

var bbcodeParser = new BBCodeHTML();       // creates object instance of BBCodeHTML()

module.exports = bbcodeParser;
