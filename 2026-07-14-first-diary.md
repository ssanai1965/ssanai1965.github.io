---
layout: default
---
<section class="section listing-head">
  <h1>{{ page.title }}</h1>
  {% if content and content != "" %}<p class="listing-desc">{{ content }}</p>{% endif %}
</section>

<section class="section">
  {% if page.cat %}
    {% assign posts = site.categories[page.cat] | sort: 'date' | reverse %}
  {% else %}
    {% assign posts = site.posts | sort: 'date' | reverse %}
  {% endif %}

  {% if posts.size == 0 %}
    <p class="empty">아직 업로드된 글이 없어요.</p>
  {% else %}
  <div class="grid">
    {% for post in posts %}
      {% include card.html post=post %}
    {% endfor %}
  </div>
  {% endif %}
</section>
