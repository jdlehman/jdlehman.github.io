require 'json'

module BowerSassPath

  PERMITTED_FILE_EXTENSIONS = ['.scss', '.sass'].freeze

  class << self

    def append_bower_components(bower_directory)
      sass_paths = get_bower_sass_paths(bower_directory)
      append_to_sass_path(sass_paths)
    end


    private

    def append_to_sass_path(*paths)
      env_path = ENV["SASS_PATH"] || ""
      new_paths = [env_path.split(File::PATH_SEPARATOR), paths].flatten
                                                               .compact
                                                               .uniq
      ENV["SASS_PATH"] = new_paths.join(File::PATH_SEPARATOR)
    end

    def get_bower_sass_paths(bower_directory)
      sass_paths = []
      Dir["#{bower_directory}/**/.bower.json"].each do |f|
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

BowerSassPath.append_bower_components('bower_components')
