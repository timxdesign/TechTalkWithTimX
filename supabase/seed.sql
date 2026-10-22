-- Starter series and a host profile. Safe to re-run.
insert into series (slug, name, description, sort_order) values
  ('founder-files', 'Founder Files', 'Founders on how they started, what nearly broke them and what they''re building now.', 1),
  ('builder-diaries', 'Builder Diaries', 'Engineers, designers and product people on the work behind the product.', 2),
  ('the-pivot', 'The Pivot', 'The moment the plan changed, and what happened next.', 3),
  ('deep-dives', 'Deep Dives', 'Long reads on companies, markets and the ideas shaping tech.', 4)
on conflict (slug) do nothing;

insert into people (slug, name, role, bio, is_staff) values
  ('timx', 'TimX', 'Host, Tech Talk with TimX', 'Host of Tech Talk with TimX.', true)
on conflict (slug) do nothing;