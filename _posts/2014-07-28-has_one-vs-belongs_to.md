---
layout: post
title: Database Associations- "Has One" vs "Belongs To"
tags:
  - rails
  - database
---

## Which One Goes Where?

One of the most confusing database relationship questions for me was always when to use `has_one` vs `belongs_to`. The relationship is a simple one-to-one relationship, and if we think about it in terms of the models, it makes a lot of sense. For example, let's say we have a `Dog` model and an `Owner` model. Immediately we can say the `Owner has_one Dog` and the `Dog belongs_to Owner`. In this case, the objects are familiar to us from our everyday life and it is easy to figure out. When the objects are more abstract like `Foo` and `Bar` it is much more difficult to determine. Let's hold that thought for a moment.

<!--more-->

The trickiest part of this whole ordeal for me was always figuring out which model object has the `foreign_key` on it, the `id` of the other model with which it is associated. This `foreign_key` is actually the only difference between the `has_one` and `belongs_to` semantic naming in a one-to-one relationship. The question is, does it go on the model that `belongs_to` the other or the one that `has_one` of the first prior? Let's go back to my original example with the `Owner` and the `Dog`. In this case, the `Owner has_one Dog`. In real life, most dogs are required to wear collars with some identification, typically the owner's name and address, in case the dog gets lost. Did you catch that? The dog has the owner's id on it, or relating it back to our database model, the `foreign_key`! Since `Dog belongs_to Owner`, the `foreign_key` will be on the `Dog` model, meaning the object that `belongs_to` the other will always have the `foreign_key` that makes the association. This example makes it easy to remember where the `foreign_key` belongs, but we still do not know how to determine which object belongs to the other in a more abstract case.

Going back to the previously mentioned example with models, `Foo` and `Bar`, let's make some assumptions. Let's assume that `Foo has_one Bar`. For you Rails users, the Rails associations would look as follows.

```ruby
# app/models/foo.rb
class Foo < ActiveRecord::Base
  has_one :bar
end

# app/models/bar.rb
class Bar < ActiveRecord::Base
  belongs_to :foo
end
```

If we want to find the `Bar` that belongs to a given `Foo`, the SQL would look something like the following.

```mysql
-- "has_one" query
-- Find the Bar that belongs to a given Foo
-- assume an intance foo of Foo already exists
SELECT *
FROM Bar
WHERE foo_id = foo.id
```

```ruby
# Rails Active Record equivalent will call the above SQL behind the scenes
foo = Foo.first
foo.bar
```

To do the inverse, get a `Foo` for a given `Bar`, the SQL would look something like the following:
```mysql
-- "belongs_to" query
-- Find the Foo that has a given Bar
-- assume an instance bar of Bar already exists
SELECT *
FROM Foo
INNER JOIN Bar ON Foo.id = Bar.foo_id
WHERE Bar.id = bar.id
```

```ruby
# Rails Active Record equivalent will call the above SQL behind the scenes
bar = Bar.first
bar.foo
```

As you can see, the `has_one` query is much simpler and more performant in general than the `belongs_to` query as it does not require a join. This means if we will typically be accessing `Foo` objects through a given `Bar` instance, it would be wise to make this case the more performant one,  the `has_one` case. Therefore a good general rule is to make the "dominant" object, the object that will typically be driving logic and asking for the associated other model, the `has_one` model. The other will naturally be the `belongs_to` model in this one-to-one association example. Keep in mind that while the "dominant" model might be doing most of the driving, the association is still there making it fairly easy to go the other way as well.

Hopefully now you know where to place the `foreign_key` (think of our `Owner has_one Dog` example) as well as the underlying reasons that this makes sense. You should also have a good sense of the SQL required to get the association in both directions and understand where to put the `foreign_key` on models that are more abstract.
