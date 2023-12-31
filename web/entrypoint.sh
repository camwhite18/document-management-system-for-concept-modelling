#!/bin/sh

# Collect static files and migrate if needed
python /home/api/manage.py collectstatic --noinput
python /home/api/manage.py makemigrations --noinput
python /home/api/manage.py makemigrations api --noinput
python /home/api/manage.py migrate --noinput
python /home/api/manage.py migrate api --noinput

# Copy the favicon to the static folder
cp /home/frontend/build/favicon.ico /home/api/static/favicon.ico

# create a new super user, with username and password 'admin'
echo "from django.contrib.auth import get_user_model
User = get_user_model()
if User.objects.count() == 0:
    User.objects.create_superuser('admin', 'admin@example.com', 'admin')
" | python manage.py shell

# Start server
/usr/local/bin/gunicorn core.wsgi:application -w 5 -b :8000