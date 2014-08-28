# == Dependencies ==============================================================
require 'rake'
require 'yaml'
require 'fileutils'
require 'tmpdir'
require 'jekyll'

# == Configuration =============================================================

# Set "rake watch" as default task
task :default => :watch

# Load the configuration file
CONFIG = YAML.load_file('_config.yml')

# Directories
POSTS = '_posts'
DRAFTS = '_drafts'

# Templates
POST_TEMPLATE = '_post_template.txt'
PAGE_TEMPLATE = '_page_template.txt'

EDITOR = 'vim'
DATE = Time.now.strftime('%Y-%m-%d')
GITHUB_REPONAME = 'jdlehman.github.io'
GITHUB_BRANCH = 'master'

# == Helpers ===================================================================

# Chech the title
def check_title(title)
  if title.nil? or title.empty?
    raise 'Please add a title to your file.'
  end
end

# Transform the filename and date to a slug
def transform_to_slug(title, extension)
  characters = /("|'|!|\?|:|\s\z)/
  whitespace = /\s/
  "#{title.gsub(characters,"").gsub(whitespace,"-").downcase}.#{extension}"
end

# Read the template file
def read_file(template)
  File.read(template)
end

# Save the file with the title in the YAML front matter
def write_file(content, title, directory, filename)
  parsed_content = "#{content.sub('title:', "title: \"#{title}\"")}"
  File.write("#{directory}/#{filename}", parsed_content)
  puts "#{filename} was created in '#{directory}'."
end

# Create the file with the slug and open the default editor
def create_file(directory, filename, content, title, editor)
  FileUtils.mkdir(directory) unless File.exists?(directory)
  if File.exists?("#{directory}/#{filename}")
    raise 'The file already exists.'
  else
    write_file(content, title, directory, filename)
    if editor && !editor.nil?
      sleep 1
      system("#{editor} #{directory}/#{filename}")
    end
  end
end

# == Tasks =====================================================================

# rake post['Title']
desc 'Create a post in _posts'
task :post, :title do |t, args|
  template = POST_TEMPLATE
  title = args[:title]
  extension = 'md'
  check_title(title)
  filename = "#{DATE}-#{transform_to_slug(title, extension)}"
  content = read_file(template)
  create_file(POSTS, filename, content, title, EDITOR)
end

# rake draft['Title']
desc 'Create a post in _drafts'
task :draft, :title do |t, args|
  template = POST_TEMPLATE
  title = args[:title]
  extension = 'md'
  check_title(title)
  filename = transform_to_slug(title, extension)
  content = read_file(template)
  create_file(DRAFTS, filename, content, title, EDITOR)
end

# rake publish
desc 'Move a post from _drafts to _posts'
task :publish do
  extension = 'md'
  files = Dir["#{DRAFTS}/*.#{extension}"]
  files.each_with_index do |file, index|
    puts "#{index + 1}: #{file}".sub("#{DRAFTS}/", '')
  end
  print '> '
  number = $stdin.gets
  if number =~ /\D/
    filename = files[number.to_i - 1].sub("#{DRAFTS}/", "")
    FileUtils.mv("#{DRAFTS}/#{filename}", "#{POSTS}/#{DATE}-#{filename}")
    puts "#{filename} was moved to '#{POSTS}'."
  else
    puts 'Please choose a draft by the assigned number.'
  end
end

# rake page['Title']
desc 'Create a page'
task :page, :title do |t, args|
  template = PAGE_TEMPLATE
  filename = 'index.html'
  title = args[:title]
  directory = args[:title]
  check_title(title)
  FileUtils.mkdir_p("#{directory}")
  content = read_file(template)
  create_file(directory, filename, content, title, EDITOR)
end

# rake build
desc 'Build the site'
task :build do
  system 'jekyll build'
end

# rake watch
# rake watch[number]
# rake watch['drafts']
desc 'Serve and watch the site (with post limit or drafts)'
task :watch, :option do |t, args|
  option = args[:option]
  if option.nil? || option.empty?
    system 'jekyll serve --watch'
  else
    if option == 'drafts'
      system 'jekyll serve --watch --drafts'
    else
      system "jekyll serve --watch --limit_posts #{option}"
    end
  end
end

namespace :production do
  # rake preview
  desc 'Launch a preview of the site in the browser'
  task :preview do
    port = CONFIG['port']
    if port.nil? || port.empty?
      port = 4000
    end
    Thread.new do
      puts 'Launching browser for preview...'
      sleep 1
      system("xdg-open http://localhost:#{port}/")
    end
    Rake::Task[:watch].invoke
  end

  # rake generate
  desc 'Generate blog files'
  task :generate do
    Jekyll::Site.new(Jekyll.configuration({
      'source'      => '.',
      'destination' => '_site',
      'config' => '_config_production.yml'
    })).process
  end

  # rake deploy
  desc 'Generate and deploy blog to gh-pages'
  task :deploy => [:generate] do
    sha = `git log`.match(/[a-z0-9]{40}/)[0]
    Dir.mktmpdir do |tmp|
      cp_r "_site/.", tmp

      pwd = Dir.pwd
      Dir.chdir tmp

      system "git init"
      system "git add ."
      message = "Site updated to #{sha} at #{Time.now.utc}"
      system "git commit -m #{message.inspect}"
      system "git remote add origin git@github.com:jdlehman/#{GITHUB_REPONAME}.git"
      system "git push origin master:refs/heads/#{GITHUB_BRANCH} --force"

      Dir.chdir pwd
    end
  end
end

namespace :iconfonts do

  desc 'Browse our icon fonts library using Fontello'
  task :browse do
    session_id = %x|curl -s -X POST -F "config=@_assets/fonts/icon_fonts/blogicons/config.json" http://fontello.com/|.chomp
    system "open 'http://fontello.com/#{session_id}'"
  end

  desc 'Update the icon fonts using the latest Fontello download.'
  task :update do
    download_zip = Dir[File.expand_path('~/Downloads/fontello-*.zip')].sort { |a,b| File.mtime(a) <=> File.mtime(b) }[0]
    system("unzip #{download_zip} -d ~/Downloads") if download_zip
    download_dir = Dir[File.expand_path('~/Downloads/fontello-*')]
      .sort { |a,b| File.mtime(a) <=> File.mtime(b) }
      .reject { |f| f =~ /\.zip$/ }[0]
    FileUtils.mv "#{download_dir}/README.txt",              '_assets/fonts/blogicons/README.txt'
    FileUtils.mv "#{download_dir}/LICENSE.txt",             '_assets/fonts/blogicons/LICENSE.txt'
    FileUtils.mv "#{download_dir}/config.json",             '_assets/fonts/blogicons/config.json'
    FileUtils.mv "#{download_dir}/font/blogicons.woff",     '_assets/fonts/blogicons.woff'
    FileUtils.mv "#{download_dir}/font/blogicons.ttf",      '_assets/fonts/blogicons.ttf'
    FileUtils.mv "#{download_dir}/font/blogicons.svg",      '_assets/fonts/blogicons.svg'
    FileUtils.mv "#{download_dir}/font/blogicons.eot",      '_assets/fonts/blogicons.eot'
    FileUtils.mv "#{download_dir}/css/blogicons-codes.css",       '_assets/stylesheets/icon_fonts/_blogicons-codes.scss'
    FileUtils.rm_rf(download_dir)
    FileUtils.rm_rf(download_zip) if download_zip
  end

end
