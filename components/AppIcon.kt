package expo.modules.reactraptor

import android.content.Context
import android.widget.ImageView
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.views.ExpoView

class AppIcon : Module() {
  override fun definition() = ModuleDefinition {
    Name("AppIcon")

    View(AppIconView::class) {
      Prop("packageName") { view: AppIconView, packageName: String? ->
        view.setPackageName(packageName)
      }
    }
  }
}

class AppIconView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  private val imageView = ImageView(context).also {
    it.scaleType = ImageView.ScaleType.FIT_CENTER
    addView(it, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
  }

  fun setPackageName(packageName: String?) {
    if (packageName.isNullOrBlank()) {
      imageView.setImageDrawable(null)
      return
    }

    try {
      val drawable = context.packageManager.getApplicationIcon(packageName)
      imageView.setImageDrawable(drawable)
    } catch (_: Exception) {
      imageView.setImageDrawable(null)
    }
  }
}
