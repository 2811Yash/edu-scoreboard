
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Subject, Assignment, Submission, AnswerKey

class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'username', 'first_name', 'last_name', 'role', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_superuser')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('username', 'first_name', 'last_name', 'role')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2', 'role', 'is_staff', 'is_superuser'),
        }),
    )
    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering = ('email',)

admin.site.register(User, CustomUserAdmin)
admin.site.register(Subject)
admin.site.register(Assignment)
admin.site.register(Submission)
admin.site.register(AnswerKey)
