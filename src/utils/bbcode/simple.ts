import BBCode from './index'

export default new BBCode({
  '\\[br\\]': '<br>',

  '\\[b\\](.+?)\\[/b\\]': '<strong>$1</strong>',
  '\\[i\\](.+?)\\[/i\\]': '<em>$1</em>',
  '\\[u\\](.+?)\\[/u\\]': '<u>$1</u>',

  '\\[h1\\](.+?)\\[/h1\\]': '<h1>$1</h1>',
  '\\[h2\\](.+?)\\[/h2\\]': '<h2>$1</h2>',
  '\\[h3\\](.+?)\\[/h3\\]': '<h3>$1</h3>',
  '\\[h4\\](.+?)\\[/h4\\]': '<h4>$1</h4>',
  '\\[h5\\](.+?)\\[/h5\\]': '<h5>$1</h5>',
  '\\[h6\\](.+?)\\[/h6\\]': '<h6>$1</h6>',

  '\\[p\\](.+?)\\[/p\\]': '<p>$1</p>',

  '\\[color=(.+?)\\](.+?)\\[/color\\]': '<span style="color:$1">$2</span>',
  '\\[size=([0-9]+)\\](.+?)\\[/size\\]': '<span style="font-size:$1px">$2</span>',

  '\\[img=(\\d+),(\\d+)\\](.*?)\\[/img\\]':
    '<div class="illus duokan-image-single"><img style="width:$1px; height:$2px" src="$3"></div>',
  '\\[img\\](.+?)\\[/img\\]': '<div class="illus duokan-image-single"><img src="$1"></div>',
  '\\[img=(.+?)\\]': '<div class="illus duokan-image-single"><img src="$1"></div>',

  '\\[email\\](.+?)\\[/email\\]': '<a href="mailto:$1">$1</a>',
  '\\[email=(.+?)\\](.+?)\\[/email\\]': '<a href="mailto:$1">$2</a>',

  '\\[url\\](.+?)\\[/url\\]': '<a href="$1">$1</a>',
  '\\[url=(.+?)\\|onclick\\](.+?)\\[/url\\]': '<a onclick="$1">$2</a>',
  '\\[url=(.+?)\\starget=(.+?)\\](.+?)\\[/url\\]': '<a href="$1" target="$2">$3</a>',
  '\\[url=(.+?)\\](.+?)\\[/url\\]': '<a href="$1">$2</a>',

  '\\[a=(.+?)\\](.+?)\\[/a\\]': '<a href="$1" name="$1">$2</a>',

  '\\[list\\](.+?)\\[/list\\]': '<ul>$1</ul>',
  '\\[\\*\\](.+?)\\[/\\*\\]': '<li>$1</li>',

  '\\[ruby=(.+?)\\](.+?)\\[/ruby\\]': '<ruby>$2<rt>$1</rt></ruby>'
})
