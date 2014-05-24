module BowerSassPath

  def self.bower_sass_paths
    @bower_sass_paths ||= get_bower_paths
  end

  def self.root
    @root ||= File.expand_path File.join(File.dirname(__FILE__), '..')
  end

  def self.get_bower_paths
    bower_paths = []

    bower_component_names.each do |component|
      component_path = bower_component_path(component)

      if component_path
        bower_paths << trim_file_name_off_path(component_path)
      else
        bower_paths << find_irregular_component_path(component)
      end
    end
    bower_paths
  end

  def self.trim_file_name_off_path(abs_path)
    abs_path.match(/^(.+)\/_.+\.scss/).captures.first
  end

  def self.find_irregular_component_path(component)
    Dir["#{bower_path}/**/_*.scss"].each do |path|
      file_name = path.match(/\/_([^\/]+)\.scss$/).captures.first
      if component.match file_name
        return trim_file_name_off_path(path)
      end
    end
    puts "\n**Warning: Path not found for bower component, #{component}**" unless found
  end

  def self.bower_path
    @bower_path ||= File.join(root, 'bower_components')
  end

  def self.bower_component_path(component_name)
    Dir["#{bower_path}/**/*_#{component_name}.scss"].first
  end

  def self.bower_component_names
    @bower_component_names ||= Dir.entries(bower_path)
    @bower_component_names.delete('.')
    @bower_component_names.delete('..')
    @bower_component_names
  end

  if ENV.has_key?('SASS_PATH')
    ENV['SASS_PATH'] = ENV['SASS_PATH'] + File::PATH_SEPARATOR + bower_sass_paths.join(File::PATH_SEPARATOR)
  else
    ENV['SASS_PATH'] = bower_sass_paths.join(File::PATH_SEPARATOR)
  end

end
