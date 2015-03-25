/**
 * File: SpriteManager.js
 * Description: Simple DOM-based sprite utility.
 * Author: Mikael Kindborg
 */

var SpriteManager = {}

SpriteManager.getPlayfieldWidth = function()
{
	return window.innerWidth
}

SpriteManager.getPlayfieldHeight = function()
{
	return window.innerHeight
}

SpriteManager.makeSprite = function()
{
	var sprite = {}

	sprite.x = 0
	sprite.y = 0
	sprite.dx = 0
	sprite.dy = 0

	sprite.setDOMElement = function(element)
	{
		sprite.domElement = element
	}

	sprite.whenLoaded = function(callback)
	{
		var image = sprite.domElement
		if (image.complete)
		{
			callback()
			return
		}
		else
		{
			image.onload = callback
		}
	}

	sprite.setLeft = function(x)
	{
		sprite.x = x
		sprite.domElement.style.left = x + 'px'
	}

	sprite.setRight = function(x)
	{
		sprite.x = x - sprite.domElement.offsetWidth
		sprite.domElement.style.left = sprite.x + 'px'
	}

	sprite.setTop = function(y)
	{
		sprite.y = y
		sprite.domElement.style.top = y + 'px'
	}

	sprite.setBottom = function(y)
	{
		sprite.y = y - sprite.domElement.offsetHeight
		sprite.domElement.style.bottom = sprite.y.offsetHeight + 'px'
	}

	sprite.setCenterX = function(x)
	{
		sprite.setLeft(x - (sprite.domElement.offsetWidth / 2))
	}

	sprite.setCenterY = function(y)
	{
		sprite.setTop(y - (sprite.domElement.offsetHeight / 2))
	}

	sprite.setDeltaX = function(dx)
	{
		sprite.dx = dx
	}

	sprite.setDeltaY = function(dy)
	{
		sprite.dy = dy
	}

	sprite.getCenterX = function()
	{
		return sprite.x + (sprite.domElement.offsetWidth / 2)
	}

	sprite.getCenterY = function()
	{
		return sprite.y + (sprite.domElement.offsetHeight / 2)
	}

	sprite.getLeft = function()
	{
		return sprite.x
	}

	sprite.getRight = function()
	{
		return sprite.x + sprite.domElement.offsetWidth
	}

	sprite.getTop = function()
	{
		return sprite.y
	}

	sprite.getBottom = function()
	{
		return sprite.y + sprite.domElement.offsetHeight
	}

	sprite.move = function()
	{
		sprite.setLeft(sprite.x + sprite.dx)
		sprite.setTop(sprite.y + sprite.dy)
	}

	sprite.show = function()
	{
		sprite.domElement.style.display = 'block'
	}

	sprite.hide = function()
	{
		sprite.domElement.style.display = 'none'
	}

	return sprite
}
