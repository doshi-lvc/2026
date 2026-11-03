# note の最新記事を取得して、index.html の JOURNAL 一覧を書き換えるスクリプト
#
# 使い方（サイトのフォルダで実行）:
#   ruby tools/update-note.rb
#
# - note の RSS（https://note.com/doshi_2026/rss）から新着順に記事を取得します
# - index.html の <!-- NOTE-FEED:START --> 〜 <!-- NOTE-FEED:END --> の間だけを書き換えます
# - 取得に失敗したときは index.html を変更せずに終了します
require "net/http"
require "uri"
require "rexml/document"
require "time"
require "cgi"

FEED_URL  = "https://note.com/doshi_2026/rss"
INDEX     = File.expand_path("../index.html", __dir__)
MAX_ITEMS = 8   # 表示する記事数
NEW_DAYS  = 7   # 投稿から何日以内を「NEW」とするか

def fetch(url, limit = 3)
  raise "リダイレクトが多すぎます" if limit.zero?
  res = Net::HTTP.get_response(URI(url))
  case res
  when Net::HTTPSuccess     then res.body.force_encoding("UTF-8")
  when Net::HTTPRedirection then fetch(res["location"], limit - 1)
  else raise "RSSの取得に失敗しました（HTTP #{res.code}）"
  end
end

def h(s)
  CGI.escapeHTML(s.to_s.strip)
end

doc = REXML::Document.new(fetch(FEED_URL))
items = REXML::XPath.match(doc, "//channel/item").map do |it|
  {
    title: it.elements["title"]&.text,
    link:  it.elements["link"]&.text,
    date:  Time.parse(it.elements["pubDate"].text).getlocal("+09:00"),
    thumb: it.elements["media:thumbnail"]&.text
  }
end
raise "記事が見つかりませんでした" if items.empty?

items = items.sort_by { |i| -i[:date].to_i }.first(MAX_ITEMS)
now = Time.now.getlocal("+09:00")

lis = items.map do |i|
  new_badge = (now - i[:date]) <= NEW_DAYS * 86_400 ? '<span class="new">NEW</span>' : ""
  thumb = i[:thumb] ? %(<img loading="lazy" src="#{h i[:thumb]}" alt="">) : ""
  %(            <li><a href="#{h i[:link]}" target="_blank" rel="noopener"><span class="thumb">#{thumb}</span><span class="body"><time datetime="#{i[:date].strftime('%Y-%m-%d')}">#{i[:date].strftime('%Y.%m.%d')}</time>#{new_badge}<span class="t">#{h i[:title]}</span></span></a></li>)
end

list = "<ul class=\"journal-list\">\n#{lis.join("\n")}\n          </ul>"
block = <<~HTML.chomp
  <!-- NOTE-FEED:START（この間は tools/update-note.rb で自動生成されます。直接編集しないでください） -->
            #{list}
            <p class="journal-updated">note 最新記事（#{now.strftime('%Y.%m.%d')} 更新）</p>
            <!-- NOTE-FEED:END -->
HTML

html = File.read(INDEX, encoding: "UTF-8")
pattern = /<!-- NOTE-FEED:START.*?<!-- NOTE-FEED:END -->/m
raise "index.html に NOTE-FEED の目印が見つかりません" unless html.match?(pattern)

# 一覧の中身（記事・NEW表示）が同じなら書き換えない。更新日の表示だけで差分が出ないようにするため
if html[pattern].include?(list)
  puts "変更なし（最新記事: #{items.first[:date].strftime('%Y.%m.%d')}「#{items.first[:title]}」）"
  exit 0
end

File.write(INDEX, html.sub(pattern) { block })
puts "更新しました（最新記事: #{items.first[:date].strftime('%Y.%m.%d')}「#{items.first[:title]}」）"
