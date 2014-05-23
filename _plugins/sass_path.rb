base_directory  = File.expand_path(File.join(File.dirname(__FILE__), '..'))
bower_path      = File.join(base_directory, 'bower_components')

if ENV.has_key?("SASS_PATH")
    ENV["SASS_PATH"] = ENV["SASS_PATH"] + File::PATH_SEPARATOR + bower_path
else
    ENV["SASS_PATH"] = bower_path
end
