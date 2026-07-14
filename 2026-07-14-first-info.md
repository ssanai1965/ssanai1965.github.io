---
layout: default
---
<article class="post">
  {% assign cat = page.categories | first %}
  <span class="chip" data-cat="{{ cat }}">{{ site.data.categories[cat] }}</span>
  <h1 class="post-title">{{ page.title }}</h1>
  <time class="post-date">{{ page.date | date: "%Y.%m.%d" }}</time>

  {% if page.image %}
  <div class="post-image">
    <img src="{{ page.image | relative_url }}" alt="">
  </div>
  {% endif %}

  <div class="post-content">
    {{ content }}
  </div>

  <a class="back-link" href="{{ site.baseurl }}/{{ cat }}/">← {{ site.data.categories[cat] }} 목록으로</a>
</article>
