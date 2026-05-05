package expo.modules.reactraptor

import android.content.pm.ApplicationInfo
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.os.Build
import android.util.Log
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File
import java.io.InputStreamReader
import java.util.concurrent.ConcurrentHashMap
import java.util.zip.ZipFile
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class ReactRaptorAppList : Module() {
  private var packageUtilities: PackageUtilities? = null

  private fun ensurePackageUtilities(promise: Promise): PackageUtilities? {
    if (packageUtilities != null) return packageUtilities

    val packageManager = appContext.reactContext?.packageManager
    if (packageManager == null) {
      promise.reject("ERROR", "PackageManager is null", null)
      return null
    }

    packageUtilities = PackageUtilities(packageManager)
    return packageUtilities
  }

  override fun definition() = ModuleDefinition {
    Name("ReactRaptorAppList")

    AsyncFunction("getAll") { promise: Promise ->
      try {
        val utils = ensurePackageUtilities(promise) ?: return@AsyncFunction

        CoroutineScope(Dispatchers.Default).launch {
          try {
            val appList = utils.getAppList()
            val mappedResults = appList.mapNotNull { packageName ->
              utils.getPackageDetails(packageName)?.let { details ->
                packageDetailsToMap(details)
              }
            }

            promise.resolve(mappedResults)
          } catch (error: Exception) {
            promise.reject("ERROR", error.message, error)
          }
        }
      } catch (error: Exception) {
        promise.reject("ERROR", error.message, error)
      }
    }

    AsyncFunction("getNativeLibraries") { packageName: String, promise: Promise ->
      try {
        val utils = ensurePackageUtilities(promise) ?: return@AsyncFunction

        CoroutineScope(Dispatchers.Default).launch {
          try {
            promise.resolve(utils.getNativeLibraries(packageName))
          } catch (error: Exception) {
            promise.reject("ERROR", error.message, error)
          }
        }
      } catch (error: Exception) {
        promise.reject("ERROR", error.message, error)
      }
    }

    AsyncFunction("getPermissions") { packageName: String, promise: Promise ->
      try {
        val utils = ensurePackageUtilities(promise) ?: return@AsyncFunction

        CoroutineScope(Dispatchers.Default).launch {
          try {
            promise.resolve(utils.getPermissions(packageName))
          } catch (error: Exception) {
            promise.reject("ERROR", error.message, error)
          }
        }
      } catch (error: Exception) {
        promise.reject("ERROR", error.message, error)
      }
    }

    AsyncFunction("getFiles") { packageName: String, paths: List<String>, promise: Promise ->
      try {
        val utils = ensurePackageUtilities(promise) ?: return@AsyncFunction

        CoroutineScope(Dispatchers.Default).launch {
          try {
            val files = utils.getFiles(packageName, paths)
            promise.resolve(files.map { file ->
              if (file == null) {
                null
              } else {
                mapOf(
                  "content" to file.content,
                  "size" to file.size,
                )
              }
            })
          } catch (error: Exception) {
            promise.reject("ERROR", error.message, error)
          }
        }
      } catch (error: Exception) {
        promise.reject("ERROR", error.message, error)
      }
    }

    AsyncFunction("getPackageDetails") { packageName: String, promise: Promise ->
      try {
        val utils = ensurePackageUtilities(promise) ?: return@AsyncFunction

        CoroutineScope(Dispatchers.Default).launch {
          try {
            promise.resolve(utils.getPackageDetails(packageName)?.let(::packageDetailsToMap))
          } catch (error: Exception) {
            promise.reject("ERROR", error.message, error)
          }
        }
      } catch (error: Exception) {
        promise.reject("ERROR", error.message, error)
      }
    }
  }

  private fun packageDetailsToMap(details: PackageDetails): Map<String, Any> {
    return mapOf(
      "packageName" to details.packageName,
      "versionName" to (details.versionName ?: ""),
      "size" to details.size,
      "appName" to details.appName,
      "isSystemApp" to details.isSystemApp,
      "firstInstallTime" to details.firstInstallTime,
      "lastUpdateTime" to details.lastUpdateTime,
      "targetSdkVersion" to details.targetSdkVersion,
    )
  }
}

private data class PackageDetails(
  val packageName: String,
  val versionName: String?,
  val size: Long,
  val appName: String,
  val isSystemApp: Boolean,
  val firstInstallTime: Long,
  val lastUpdateTime: Long,
  val targetSdkVersion: Int,
)

private data class FileInfo(
  val content: String,
  val size: Long,
)

private class PackageUtilities(
  private val packageManager: PackageManager,
) {
  companion object {
    private const val TAG = "ReactRaptorPackages"
  }

  private val packageInfoCache = ConcurrentHashMap<String, PackageInfo>()

  suspend fun getAppList(): List<String> = withContext(Dispatchers.Default) {
    try {
      packageInfoCache.clear()
      val packages = getInstalledPackages()
      packages.forEach { packageInfo ->
        packageInfoCache[packageInfo.packageName] = packageInfo
      }

      packageInfoCache.keys().toList()
    } catch (error: Exception) {
      Log.e(TAG, "Failed to get app list", error)
      emptyList()
    }
  }

  suspend fun getPackageDetails(packageName: String): PackageDetails? =
    withContext(Dispatchers.Default) {
      try {
        val packageInfo = getCachedPackageInfo(packageName) ?: return@withContext null
        val appInfo = packageInfo.applicationInfo ?: return@withContext null

        PackageDetails(
          packageName = packageInfo.packageName,
          versionName = packageInfo.versionName ?: "",
          size = getApkSize(appInfo),
          appName = getApplicationLabel(packageInfo),
          isSystemApp = isSystemApp(appInfo),
          firstInstallTime = packageInfo.firstInstallTime,
          lastUpdateTime = packageInfo.lastUpdateTime,
          targetSdkVersion = appInfo.targetSdkVersion,
        )
      } catch (error: Exception) {
        Log.e(TAG, "Error getting package details for $packageName", error)
        null
      }
    }

  suspend fun getNativeLibraries(packageName: String): List<String> =
    withContext(Dispatchers.Default) {
      try {
        val packageInfo = getCachedPackageInfo(packageName) ?: return@withContext emptyList()
        val appInfo = packageInfo.applicationInfo ?: return@withContext emptyList()

        findNativeLibraries(appInfo)
      } catch (error: Exception) {
        Log.e(TAG, "Error getting native libraries for $packageName", error)
        emptyList()
      }
    }

  suspend fun getPermissions(packageName: String): List<String> =
    withContext(Dispatchers.Default) {
      try {
        val packageInfo = getCachedPackageInfo(packageName) ?: return@withContext emptyList()
        val permissions = mutableListOf<String>()

        packageInfo.requestedPermissions?.let { permissions.addAll(it) }

        permissions
      } catch (error: Exception) {
        Log.e(TAG, "Error getting app permissions for $packageName", error)
        emptyList()
      }
    }

  suspend fun getFiles(packageName: String, paths: List<String>): List<FileInfo?> =
    withContext(Dispatchers.IO) {
      try {
        val packageInfo = getCachedPackageInfo(packageName) ?: return@withContext paths.map { null }
        val appInfo = packageInfo.applicationInfo ?: return@withContext paths.map { null }
        val foundFiles = mutableMapOf<String, FileInfo>()

        scanPackageFiles(appInfo.sourceDir, paths, foundFiles)
        appInfo.splitSourceDirs?.forEach { splitSourceDir ->
          scanPackageFiles(splitSourceDir, paths, foundFiles)
        }

        paths.map { path -> foundFiles[path] }
      } catch (error: Exception) {
        Log.e(TAG, "Error getting files for $packageName", error)
        paths.map { null }
      }
    }

  private suspend fun getCachedPackageInfo(packageName: String): PackageInfo? =
    withContext(Dispatchers.Default) {
      packageInfoCache[packageName] ?: getPackageInfo(packageName)
    }

  private fun getPackageInfo(packageName: String): PackageInfo? {
    return try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        packageManager.getPackageInfo(
          packageName,
          PackageManager.PackageInfoFlags.of(
            (PackageManager.GET_META_DATA or PackageManager.GET_PERMISSIONS).toLong()
          )
        )
      } else {
        @Suppress("DEPRECATION")
        packageManager.getPackageInfo(
          packageName,
          PackageManager.GET_META_DATA or PackageManager.GET_PERMISSIONS
        )
      }
    } catch (error: Exception) {
      Log.e(TAG, "Error getting package info for $packageName", error)
      null
    }
  }

  private fun getInstalledPackages(): List<PackageInfo> {
    return try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        packageManager.getInstalledPackages(
          PackageManager.PackageInfoFlags.of(
            (PackageManager.GET_META_DATA or PackageManager.GET_PERMISSIONS).toLong()
          )
        )
      } else {
        @Suppress("DEPRECATION")
        packageManager.getInstalledPackages(
          PackageManager.GET_META_DATA or PackageManager.GET_PERMISSIONS
        )
      }
    } catch (error: Exception) {
      Log.e(TAG, "Error getting installed packages", error)
      emptyList()
    }
  }

  private fun scanPackageFiles(
    sourceDir: String?,
    paths: List<String>,
    foundFiles: MutableMap<String, FileInfo>,
  ) {
    if (sourceDir == null) return

    try {
      ZipFile(sourceDir).use { zip ->
        zip.entries().asSequence()
          .filter { entry -> !entry.isDirectory }
          .forEach { entry ->
            val entryPath = entry.name
            val matchedPath = paths.find { path ->
              entryPath == path || entryPath.endsWith("/$path")
            }

            if (matchedPath != null && !foundFiles.containsKey(matchedPath)) {
              try {
                zip.getInputStream(entry).use { input ->
                  val content = InputStreamReader(input).readText()
                  foundFiles[matchedPath] = FileInfo(content, entry.size)
                }
              } catch (error: Exception) {
                Log.e(TAG, "Failed to read ${entry.name}: ${error.message}")
              }
            }
          }
      }
    } catch (error: Exception) {
      Log.e(TAG, "Failed to process APK $sourceDir: ${error.message}")
    }
  }

  private fun getApkSize(appInfo: ApplicationInfo): Long {
    if (appInfo.sourceDir == null) return 0L

    return try {
      File(appInfo.sourceDir).length()
    } catch (error: Exception) {
      Log.e(TAG, "Failed to get APK size for ${appInfo.packageName}", error)
      0L
    }
  }

  private fun getApplicationLabel(packageInfo: PackageInfo): String {
    return try {
      packageInfo.applicationInfo?.let { appInfo ->
        packageManager.getApplicationLabel(appInfo).toString()
      } ?: packageInfo.packageName
    } catch (_: Exception) {
      packageInfo.packageName
    }
  }

  private suspend fun findNativeLibraries(appInfo: ApplicationInfo): List<String> =
    withContext(Dispatchers.IO) {
      val nativeLibraries = mutableSetOf<String>()
      val architectures = listOf("arm64-v8a", "armeabi-v7a", "x86", "x86_64")

      val nativeLibraryDirs = buildList {
        add(appInfo.nativeLibraryDir)
        add("${appInfo.dataDir}/lib")
        add("${appInfo.sourceDir}/lib")

        architectures.forEach { architecture ->
          add("${appInfo.sourceDir}/lib/$architecture")
        }

        appInfo.splitSourceDirs?.forEach { splitSourceDir ->
          add("$splitSourceDir/lib")
          architectures.forEach { architecture ->
            add("$splitSourceDir/lib/$architecture")
          }
        }
      }.distinct()

      nativeLibraryDirs.forEach { dirPath ->
        try {
          val dir = File(dirPath)
          if (dir.exists() && dir.isDirectory) {
            dir.walkTopDown()
              .maxDepth(5)
              .filter { file -> file.isFile && file.extension == "so" }
              .forEach { file -> nativeLibraries.add(file.name) }
          }
        } catch (error: Exception) {
          Log.e(TAG, "Failed to scan directory $dirPath: ${error.message}")
        }
      }

      scanNativeLibrariesFromApk(appInfo.sourceDir, architectures, nativeLibraries)
      appInfo.splitSourceDirs?.forEach { splitSourceDir ->
        scanNativeLibrariesFromApk(splitSourceDir, architectures, nativeLibraries)
      }

      nativeLibraries.toList()
    }

  private fun scanNativeLibrariesFromApk(
    sourceDir: String?,
    architectures: List<String>,
    nativeLibraries: MutableSet<String>,
  ) {
    if (sourceDir == null) return

    try {
      ZipFile(sourceDir).use { zip ->
        zip.entries().asSequence()
          .filter { entry ->
            entry.name.endsWith(".so") &&
              architectures.any { architecture -> entry.name.contains("lib/$architecture/") }
          }
          .take(1000)
          .forEach { entry ->
            nativeLibraries.add(entry.name.split("/").last())
          }
      }
    } catch (error: Exception) {
      Log.e(TAG, "Failed to scan APK $sourceDir: ${error.message}")
    }
  }

  private fun isSystemApp(appInfo: ApplicationInfo?): Boolean {
    return appInfo?.let {
      (it.flags and ApplicationInfo.FLAG_SYSTEM) != 0
    } ?: false
  }
}
