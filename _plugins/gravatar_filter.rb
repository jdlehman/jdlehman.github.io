require 'digest/md5'

module Jekyll
  module GravatarFilter
    def gravatar(email, size=150)
      "http://www.gravatar.com/avatar/#{hash(email)}?s=#{size}"
    end

    private


    def hash(email)
      Digest::MD5.hexdigest(email.downcase.strip)
    end
  end
end

Liquid::Template.register_filter(Jekyll::GravatarFilter)
