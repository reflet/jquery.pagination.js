(function($){
	$.fn.pagination=function(config){
		var defaults={
			 total:0
			,limit:5
			,pageNum:10
			,current:0
			,initProcess:function(page, limit){ }
			,callback:function(page, limit){ }
			,template:''
		}
		
		var options = $.extend(defaults, config);
		
		// クロージャ
		var func = {
			// テンプレートを取得
			template:function(){
				if(options.template !== '') return options.template;
				
				// 雛形のテンプレートを挿入
				var tmp;
				tmp  = '<p class="jq-pagination">';
				tmp += '<div class="jq-pagination-left">';
				tmp += '<span class="jq-pagination-total">1</span>件中&nbsp;';
				tmp += '<span class="jq-pagination-range">1-1</span>件を表示';
				tmp += '</div>';
				tmp += '<div class="jq-pagination-right">';
				tmp += '<div class="jq-pagination-prev"><a href="javascript:void(0)">前のページ</a><span style="display:none;">前のページ</span></div>';
				tmp += '<ul class="jq-pagination-num"></ul>';
				tmp += '<div class="jq-pagination-next"><a href="javascript:void(0)">次のページ</a><span style="display:none;">次のページ</span></div>';
				tmp += '</div>';
				tmp += '<br class="jq-pagination-clear">';
				tmp += '</p>';
				options.template = $(tmp);
				
				return options.template;
			}
			// ページ番号のボタンを取得
			,pagerNum:function(a){
				return '<li><a href="javascript:void(0);" class="jq-pagenum-'  + a + '">' + a + '</a></li>';
			}
			// ページ番号の一括生成
			,createNumBtn:function(){
				var s, e, cur = func.current(), pages = func.pages(), pageNum = func.pageNum();
				if(cur <= options.diff_p){
					s = 1;
					e = (pageNum > pages) ? pages : pageNum;
				}else if((cur + options.diff_p) > pages){
					s = pages - pageNum + 1;
					e = pages;
				}else{
					s = cur - options.diff_p;
					e = cur + options.diff_n;
				}
				var html = [];
				for(var i=s; i<=e; ++i) { html.push(func.pagerNum(i)); }
				return html.join('');
			}
			// ページ番号の変更処理
			,chgNumBtn:function(a){
				var c = func.current(), p = func.pages();
				var down = c - options.diff_p, up = c + options.diff_n;
				if(a === '+'){
					if(down >= 1 && up < p){
						$('a.jq-pagenum-' + (down)).parent().remove();
						$('ul.jq-pagination-num').append(func.pagerNum(up + 1));
					}
				}else if(a === '-'){
					if(down > 1 && up <= p){
						$('a.jq-pagenum-' + (up)).parent().remove();
						$('ul.jq-pagination-num').prepend(func.pagerNum(down - 1));
					}
				}
			}
			// 現在のページ番号をセット/取得
			,current:function(a){
				if($.type(a) === 'undefined') return parseInt(options.current, 10);
				
				var p = func.pages();
				if(a < 0 || a > p) return false;
				
				$('ul.jq-pagination-num li a').removeClass('pageNow');
				$('a.jq-pagenum-' + a).addClass('pageNow');
				options.current = parseInt(a, 10);
				
				// 『前のページ』ボタンの表示・非表示制御
				if(a === 1){
					$('div.jq-pagination-prev a').hide().next().show();
				}else{
					$('div.jq-pagination-prev a').show().next().hide();
				}
				// 『次のページ』ボタンの表示・非表示制御
				if(a === p){
					$('div.jq-pagination-next a').hide().next().show();
				}else{
					$('div.jq-pagination-next a').show().next().hide();
				}
			}
			// 表示範囲を取得
			,range:function(){
				var c = func.current(), l = func.limit(), t = func.total();
				var s = ((c - 1) < 1) ? 1 : (c - 1) * l + 1;
				var e = ((c * l) < t) ? (c * l) : t;
				return s + '-' + e;
			}
			// 総件数をセット/取得
			,total:function(a){
				if($.type(a) !== 'number') return options.total;
				options.total = (a > 0) ? a : 0;
			}
			// 総件数をセット/取得
			,limit:function(a){
				if($.type(a) !== 'number') return options.limit;
				options.limit = (a > 0) ? a : 0;
			}
			// 総ページ数をセット/取得
			,pages:function(a){
				if($.type(a) !== 'number') return options.pages;
				options.pages = (a > 0) ? a : 0;
			}
			// ページ番号表示件数をセット/取得
			,pageNum:function(a){
				if($.type(a) !== 'number') return options.pageNum;
				options.pageNum = (a > 0) ? a : 0;
			}
			// コールバック関数をセット/実行
			,callback:function(){
				options.callback(func.current(), func.limit());
			}
		}
		
		// 総ページ数を算出
		var pages  = (func.total() < func.limit()) ? 1 : Math.ceil(func.total()/func.limit());
		func.pages(pages);
		
		// 表示範囲(prev/next)
		var pageNum = func.pageNum();
		options.diff_p = Math.ceil((pageNum - 1)/2);
		options.diff_n = pageNum - 1 - options.diff_p;
		
		return this.each(function(i){
			var tmp, range, page;
			
			// テンプレート取得し、挿入する(※cloneしないと複数の箇所に入れられない)
			tmp = $(func.template()).clone(false);
			$(this).html(tmp);
			
			// 現在のページ番号を取得
			page = func.current()
			
			// 表示範囲の枠を取得
			range = $('span.jq-pagination-range', this);
			
			// ページ番号を挿入
			$('ul.jq-pagination-num', this).html(func.createNumBtn());
			
			// 総件数を挿入
			$('span.jq-pagination-total', this).text(func.total());
			
			// ページ番号をセットし、ページ番号の表示切替
			func.current(page);
			
			// 表示範囲を挿入
			range.text(func.range());
			
			// 初期ページを取得
			if(i==0) options.initProcess(page, func.limit());
			
			// 『前のページ』ボタン
			$('div.jq-pagination-prev a', this).click(function(ev){
				var a = func.current() - 1;
				if(a < 1) a = 1;
				
				func.chgNumBtn('-'), func.current(a);
				range.text(func.range()), func.callback();
			});
			
			// 『ページ番号』ボタン
			$('ul.jq-pagination-num li a', this).click(function(ev){
				if($(this).hasClass('pageNow')) return;
				
				var a = $(this).text();
				var b = (a > func.current()) ? '+' : '-';
				
				func.chgNumBtn(b), func.current(a);
				range.text(func.range()), func.callback();
			});
			
			// 『次のページ』ボタン
			$('div.jq-pagination-next a', this).click(function(ev){
			var a = func.current() + 1;
			if(a > func.total()) a = func.total();
				
				func.chgNumBtn('+'), func.current(a);
				range.text(func.range()), func.callback();
			});
		});
	};
})(jQuery)
