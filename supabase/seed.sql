-- ============================================================
-- Seed the download_links table with the CURRENT OneDrive URLs
-- (copied from the previously hardcoded values in the site).
-- Run AFTER setup.sql. Safe to re-run: upserts on conflict.
-- ============================================================

insert into public.download_links (product_key, variant_key, url) values
  ('mandi',   'single', 'https://onedrive.live.com/?redeem=aHR0cHM6Ly8xZHJ2Lm1zL3UvYy85OTYyMjc1Y2ViMDE5MzA2L0lRRE9rY3J4WXBORlFhNFFuTzFRNUNvekFmcjR4MDZYOFVETjY0eldpX0NrcjJFP2U9Vmo3cnRH&cid=9962275CEB019306&id=9962275CEB019306%21sf1ca91ce93624145ae109ced50e42a33&parId=9962275CEB019306%21sbedc6f2afeff48b78db118964be08629&o=OneUp'),
  ('mandi',   'multi',  'https://onedrive.live.com/?redeem=aHR0cHM6Ly8xZHJ2Lm1zL3UvYy85OTYyMjc1Y2ViMDE5MzA2L0lRQkdITHZVSFBmY1NJdkRsQVM2eTR5TUFZYjRaQ0VaRE9rWGxyQTJSV2hDeGdJP2U9SnFxaGRr&cid=9962275CEB019306&id=9962275CEB019306%21sd4bb1c46f71c48dc8bc39404bacb8c8c&parId=9962275CEB019306%21sbedc6f2afeff48b78db118964be08629&o=OneUp'),
  ('brokwin', 'single', 'https://onedrive.live.com/?redeem=aHR0cHM6Ly8xZHJ2Lm1zL3UvYy85OTYyMjc1Y2ViMDE5MzA2L0lRRGwxRHJHX2Nhc1FiNy01cEg2czNQZUFZVXQwa0FEdEhqVkpLTGxxN1BFb2pvP2U9YnUwTE01&cid=9962275CEB019306&id=9962275CEB019306%21sc63ad4e5c6fd41acbefee691fab373de&parId=9962275CEB019306%21sbedc6f2afeff48b78db118964be08629&o=OneUp'),
  ('brokwin', 'multi',  'https://onedrive.live.com/?redeem=aHR0cHM6Ly8xZHJ2Lm1zL3UvYy85OTYyMjc1Y2ViMDE5MzA2L0lRQmdFR0M2STN1dFJLc3JsUS1FUTJVV0FVZzhhUDE3OXZaRDFOdEZIalRLRU1NP2U9U0VUMkZu&cid=9962275CEB019306&id=9962275CEB019306%21sba6010607b2344adab2b950f84436516&parId=9962275CEB019306%21sbedc6f2afeff48b78db118964be08629&o=OneUp'),
  ('coldwin', 'single', 'https://onedrive.live.com/?cid=9962275ceb019306&id=9962275CEB019306%21sfaae245eacdf4cf8b8a8f6d80b5cac8b&resid=9962275CEB019306%21sfaae245eacdf4cf8b8a8f6d80b5cac8b&e=T6SbgP&migratedtospo=true&redeem=aHR0cHM6Ly8xZHJ2Lm1zL3UvYy85OTYyMjc1Y2ViMDE5MzA2L0lRQmVKSzc2MzZ6NFRMaW85dGdMWEt5TEFRUEotTWh5RGVFYy1xR2dZaHgyaldnP2U9VDZTYmdQ&v=validatepermission'),
  ('coldwin', 'multi',  'https://onedrive.live.com/?redeem=aHR0cHM6Ly8xZHJ2Lm1zL3UvYy85OTYyMjc1Y2ViMDE5MzA2L0lRRGUyR2YxQ1FrM1JhN1I5NE5WbGJuNEFkMWRrS0I4cXZadmlyOUNSQmdIY1hRP2U9YmpPbGtF&cid=9962275CEB019306&id=9962275CEB019306%21sf567d8de09094537aed1f7835595b9f8&parId=9962275CEB019306%21s711b58f7a4bc4bc6a8f0c875159f065c&o=OneUp')
on conflict (product_key, variant_key) do update set url = excluded.url, updated_at = now();
