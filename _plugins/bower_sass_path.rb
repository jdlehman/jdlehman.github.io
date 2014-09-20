require 'json'

module BowerSassPath

  PERMITTED_FILE_EXTENSIONS = ['.scss', '.sass'].freeze

  class << self
    def sass_paths
      @sass_paths ||= get_sass_paths.uniq
    end

    def root
      @root ||= File.expand_path File.join(File.dirname(__FILE__), '..')
    end

    def bower_path
      @bower_path ||= File.join(root, 'bower_components')
    end

    def get_sass_paths
      sass_paths = []
      Dir["#{bower_path}/**/.bower.json"].each do |f|
        get_main_paths(f).each do |path|
          sass_paths << path
        end
      end
      sass_paths
    end

    def get_main_paths(file_name)
      base_directory = File.dirname(file_name)
      bower_json = JSON.parse(File.read(file_name))

      main_files = wrap_in_array(bower_json['main'])
        .select { |main_file| PERMITTED_FILE_EXTENSIONS.include? File.extname(main_file) }
        .map { |main_file| "#{base_directory}/#{File.dirname(main_file)}" }
    end

    def wrap_in_array(object)
      if object.nil?
        []
      elsif object.respond_to?(:to_ary)
        object.to_ary || [object]
      else
        [object]
      end
    end
  end

end

if ENV.has_key?('SASS_PATH')
  ENV['SASS_PATH'] = ENV['SASS_PATH'] + File::PATH_SEPARATOR + BowerSassPath.sass_paths.join(File::PATH_SEPARATOR)
else
  ENV['SASS_PATH'] = BowerSassPath.sass_paths.join(File::PATH_SEPARATOR)
end
