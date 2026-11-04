-- 0002_seed_categories.sql
-- The ten predefined award categories. There is deliberately no overall Player of the Season.

insert into public.award_categories (slug, name, short_name, winner_type, position_group, sort_order) values
  ('goalkeeper',            'The Optimus Goalkeeper of the Season',            'Goalkeeper',            'player', 'goalkeeper', 1),
  ('centre-back',           'The Optimus Centre-Back of the Season',           'Centre-Back',           'player', 'defence',    2),
  ('full-back',             'The Optimus Full-Back of the Season',             'Full-Back',             'player', 'defence',    3),
  ('defensive-midfielder',  'The Optimus Defensive Midfielder of the Season',  'Defensive Midfielder',  'player', 'midfield',   4),
  ('central-midfielder',    'The Optimus Central Midfielder of the Season',    'Central Midfielder',    'player', 'midfield',   5),
  ('attacking-midfielder',  'The Optimus Attacking Midfielder of the Season',  'Attacking Midfielder',  'player', 'midfield',   6),
  ('winger',                'The Optimus Winger of the Season',                'Winger',                'player', 'attack',     7),
  ('striker',               'The Optimus Striker of the Season',               'Striker',               'player', 'attack',     8),
  ('breakthrough-team',     'The Optimus Breakthrough Team of the Season',     'Breakthrough Team',     'team',   'team',       9),
  ('coach',                 'The Optimus Coach of the Season',                 'Coach',                 'coach',  'staff',     10)
on conflict (slug) do nothing;
