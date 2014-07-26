module BowerSassPath

  def self.bower_sass_paths
    @bower_sass_paths ||= get_bower_paths
  end

  def self.root
    @root ||= File.expand_path File.join(File.dirname(__FILE__), '..')
  end

  def self.get_bower_paths
    bower_paths = []
    Dir["#{bower_path}/**/.bower.json"].each do |f|
      bower_paths << parse_bower_main_path(f)
    end
    bower_paths
  end

  def self.parse_bower_main_path(file)
    "#{trim_file_name_off_path(file)}/#{trim_file_name_off_path(get_property(get_main(file)))}"
  end

  def self.get_main(file)
    File.foreach(file).grep(/"main/).join
  end

  def self.get_property(main)
    main.match(/"main":.+"(.+)".+$/).captures.first
  end

  def self.trim_file_name_off_path(abs_path)
    if abs_path.match(/\//)
      abs_path.match(/^(.+)\/[^\/]+$/).captures.first
    else
      ""
    end
  end

  def self.bower_path
    @bower_path ||= File.join(root, 'bower_components')
  end

  if ENV.has_key?('SASS_PATH')
    ENV['SASS_PATH'] = ENV['SASS_PATH'] + File::PATH_SEPARATOR + bower_sass_paths.join(File::PATH_SEPARATOR)
  else
    ENV['SASS_PATH'] = bower_sass_paths.join(File::PATH_SEPARATOR)
  end

end
