// 生成 Html -> Markdown 对照数据，给 Api 端 HtmlToMarkdown 的一致性测试用。
// 配置必须和 Web/src/components/html/Editor/MarkDown.vue 保持一致。
// 用法: cd Web && bun scripts/dump-turndown-fixtures.mjs > ../Api/Api.Tests/Infrastructure/Text/turndown-fixtures.json
import TurndownService from '@joplin/turndown'
import { gfm } from '@joplin/turndown-plugin-gfm'

const turndownService = new TurndownService({
  codeBlockStyle: 'fenced',
  headingStyle: 'atx',
})
turndownService.use(gfm)
turndownService.keep(['ruby', 'rt'])
turndownService.addRule('ignoreCodeTool', {
  filter: function (node) {
    return node.classList && node.classList.contains('md-editor-code-action')
  },
  replacement: function () {
    return ''
  },
})
turndownService.addRule('preserveDot', {
  filter: function (node) {
    return node.classList && node.classList.contains('dot')
  },
  replacement: function (content, node) {
    return node.outerHTML
  },
})
turndownService.addRule('convertPBrToBr', {
  filter: function (node) {
    return node.nodeName === 'BR'
  },
  replacement: function () {
    return '<br>\r\n'
  },
})

const samples = [
  ['empty', ''],
  ['plain-text', 'hello world'],
  ['paragraphs', '<p>第一段</p><p>第二段</p>'],
  ['paragraph-with-br', '<p>上句<br>下句</p>'],
  ['double-br', '<p>上句<br><br>下句</p>'],
  ['nbsp-paragraph', '<p>\u00a0缩进的一段</p>'],
  ['empty-paragraph', '<p></p><p>正文</p>'],
  ['headings', '<h1>一级</h1><h2>二级</h2><h3>三级</h3><h6>六级</h6>'],
  ['inline-marks', '<p><strong>粗</strong>和<em>斜</em>和<del>删</del>和<mark>高亮</mark></p>'],
  ['inline-mixed-spacing', '<p>前 <strong> 粗体 </strong> 后</p>'],
  ['nested-inline', '<p><strong>粗<em>斜</em></strong></p>'],
  ['ruby', '<p><ruby>漢字<rt>かんじ</rt></ruby>注音</p>'],
  ['dot', '<p>这里有<span class="dot">着重号</span>结束</p>'],
  ['sup-sub-ins', '<p>x<sup>2</sup>+y<sub>1</sub><ins>下划线</ins></p>'],
  ['underline-style', '<p><span style="text-decoration: underline;">下划线</span></p>'],
  ['link', '<p>见<a href="https://example.com/a b">这里</a></p>'],
  ['link-bare', '<p><a href="https://example.com">https://example.com</a></p>'],
  ['link-title', '<p><a href="https://example.com" title="标题(x)">文字</a></p>'],
  ['image', '<p><img src="https://img.example.com/1.png" alt="封面"></p>'],
  ['image-in-div', '<div class="illus"><img src="https://img.example.com/1.png"></div>'],
  ['blockquote', '<blockquote><p>引用第一段</p><p>引用第二段</p></blockquote>'],
  ['unordered-list', '<ul><li>甲</li><li>乙</li></ul>'],
  ['ordered-list', '<ol><li>甲</li><li>乙</li></ol>'],
  ['ordered-list-start', '<ol start="9"><li>甲</li><li>乙</li><li>丙</li></ol>'],
  ['nested-list', '<ul><li>甲<ul><li>甲一</li></ul></li><li>乙</li></ul>'],
  ['task-list', '<ul><li><input type="checkbox" checked> 完成</li><li><input type="checkbox"> 未完成</li></ul>'],
  ['hr', '<p>上</p><hr><p>下</p>'],
  ['inline-code', '<p>调用 <code>foo()</code> 即可</p>'],
  ['fenced-code', '<pre><code class="language-ts">const a = 1\nconst b = 2\n</code></pre>'],
  [
    'code-with-toolbar',
    '<pre><span class="md-editor-code-action">复制</span><code class="language-js">let x = 1\n</code></pre>',
  ],
  [
    'table',
    '<table><thead><tr><th>名称</th><th>说明</th></tr></thead><tbody><tr><td>甲</td><td>第一</td></tr></tbody></table>',
  ],
  ['table-no-head', '<table><tbody><tr><td>甲</td><td>乙</td></tr><tr><td>丙</td><td>丁</td></tr></tbody></table>'],
  [
    'table-align',
    '<table><thead><tr><th align="left">左</th><th align="center">中</th><th align="right">右</th></tr></thead><tbody><tr><td>1</td><td>2</td><td>3</td></tr></tbody></table>',
  ],
  ['table-with-list', '<table><tbody><tr><td><ul><li>甲</li></ul></td><td>乙</td></tr></tbody></table>'],
  ['escapes', '<p>* 星号 _下划线_ [方括号] `反引号` # 井号 1. 数字 $美元 \\反斜杠</p>'],
  ['leading-dash', '<p>- 不是列表</p>'],
  ['html-text', '<p>标签写法是 &lt;p&gt; 这样</p>'],
  ['whitespace-collapse', '<p>  多个   空格\n换行  </p>'],
  ['div-wrapped-text', '<div>甲</div><div>乙</div>'],
  ['unknown-inline', '<p>前<u>下划</u>后</p>'],
  [
    'novel-chapter',
    '<p>「<span class="dot">早上好</span>。」</p><p>他<strong>猛地</strong>回头，<ruby>視線<rt>しせん</rt></ruby>相交。<br>然后——</p><div class="illus"><img src="https://img.example.com/p1.jpg" alt=""></div><p>　　接下来的事，谁都没料到。</p>',
  ],
  ['code-with-backticks', '<p>写作 <code>a ` b</code> 或 <code>``x``</code></p>'],
  ['code-padding', '<p><code> spaced </code></p>'],
  ['pre-monospace', '<pre style="font-family: monospace;">line1\nline2</pre>'],
  ['pre-plain', '<pre>line1\nline2</pre>'],
  ['table-colspan', '<table><tbody><tr><td colspan="2">合并</td></tr><tr><td>甲</td><td>乙</td></tr></tbody></table>'],
  ['table-single-cell', '<table><tbody><tr><td>只有一个</td></tr></tbody></table>'],
  [
    'table-caption',
    '<table><caption>表名</caption><thead><tr><th>甲</th><th>乙</th></tr></thead><tbody><tr><td>1</td><td>2</td></tr></tbody></table>',
  ],
  [
    'table-multiline-cell',
    '<table><thead><tr><th>甲</th><th>乙</th></tr></thead><tbody><tr><td>上<br>下</td><td>x</td></tr></tbody></table>',
  ],
  ['ordered-list-two-digits', '<ol start="9"><li>九</li><li>十</li><li>十一</li></ol>'],
  ['list-item-with-paragraphs', '<ul><li><p>第一段</p><p>第二段</p></li><li>乙</li></ul>'],
  ['list-with-nbsp', '<ul><li>\u00a0</li><li>乙</li></ul>'],
  ['nested-blockquote', '<blockquote><blockquote><p>套两层</p></blockquote><p>外层</p></blockquote>'],
  ['inline-nbsp', '<p>甲\u00a0乙</p>'],
  ['inline-space-across-tags', '<p><em>甲</em> <strong>乙</strong></p>'],
  ['inline-trailing-space-in-tag', '<p><em>甲 </em>乙</p>'],
  ['ideographic-space', '<p>　　全角空格开头</p>'],
  ['blank-inline', '<p><span> </span></p>'],
  ['blank-div', '<div>   </div><p>正文</p>'],
  ['img-only-block', '<img src="https://img.example.com/1.png">'],
  ['img-no-src', '<p><img alt="没有地址"></p>'],
  ['comment', '<p>甲<!-- 注释 -->乙</p>'],
  ['heading-with-inline', '<h2>标题<em>斜</em></h2>'],
  ['setext-underline-text', '<p>=== 不是标题</p>'],
  ['plus-list-text', '<p>+ 不是列表</p>'],
  ['quote-text', '<p>&gt; 不是引用</p>'],
  ['tilde-fence-text', '<p>~~~不是围栏</p>'],
  ['link-in-list', '<ul><li><a href="https://example.com/x">链接</a></li></ul>'],
  ['deep-nesting', '<div><div><p>甲<strong>乙<em>丙</em></strong></p><ul><li>丁</li></ul></div></div>'],
  ['multiple-brs-and-text', '<p>一<br>二<br><br>三</p>'],
]

const output = {}
for (const [name, html] of samples) {
  output[name] = { html, markdown: turndownService.turndown(html) }
}

process.stdout.write(JSON.stringify(output, null, 2) + '\n')
